import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTimeLockedWallet } from "../target/types/solana_time_locked_wallet";
import { expect } from "chai";
import { LiteSVM } from "litesvm";

function createPDA(
  user: anchor.web3.Keypair,
  program: anchor.Program<SolanaTimeLockedWallet>,
  timestamp: number
): anchor.web3.PublicKey {
  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("wallet"),
      user.publicKey.toBuffer(),
      new anchor.BN(timestamp).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  return pda;
}

describe("initialize_lock program", () => {
  const program = anchor.workspace
    .solanaTimeLockedWallet as Program<SolanaTimeLockedWallet>;

  let svm: LiteSVM;
  const user = anchor.web3.Keypair.generate();
  const userInitBalance = anchor.web3.LAMPORTS_PER_SOL * 10;
  let walletPDA: anchor.web3.PublicKey;
  const depositAmount = anchor.web3.LAMPORTS_PER_SOL * 2;

  before(async () => {
    svm = new LiteSVM();
    svm.addProgramFromFile(
      program.programId,
      "./target/deploy/solana_time_locked_wallet.so"
    );

    const now = Math.floor(Date.now() / 1000);
    walletPDA = createPDA(user, program, now);

    svm.airdrop(user.publicKey, BigInt(userInitBalance));
  });

  it("User can not use passed unlock timestamp", async () => {
    const now = Math.floor(Date.now() / 1000);

    const initialClock = svm.getClock();
    initialClock.unixTimestamp = BigInt(now);
    svm.setClock(initialClock);

    const unlockTimestamp = now - 60 * 60 * 24;

    const initializeIx = await program.methods
      .initializeLock(
        new anchor.BN(depositAmount),
        new anchor.BN(unlockTimestamp),
        new anchor.BN(now)
      )
      .accounts({
        wallet: walletPDA,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    const initTx = new anchor.web3.Transaction().add(initializeIx);
    initTx.recentBlockhash = svm.latestBlockhash();
    initTx.sign(user);

    const res = svm.sendTransaction(initTx);
    expect(res.toString()).to.include("UnlockTimestampPassed");
  });

  it("User can deposit to time-locked wallet successfully!", async () => {
    const now = Math.floor(Date.now() / 1000);

    const initialClock = svm.getClock();
    initialClock.unixTimestamp = BigInt(now);
    svm.setClock(initialClock);

    const unlockTimestamp = now + 60 * 60 * 24;

    const userBalanceBefore = Number(svm.getBalance(user.publicKey));

    const initializeIx = await program.methods
      .initializeLock(
        new anchor.BN(depositAmount),
        new anchor.BN(unlockTimestamp),
        new anchor.BN(now)
      )
      .accounts({
        wallet: walletPDA,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    const initTx = new anchor.web3.Transaction().add(initializeIx);
    initTx.recentBlockhash = svm.latestBlockhash();
    initTx.sign(user);

    svm.sendTransaction(initTx);

    const walletBalance = Number(svm.getBalance(walletPDA));
    const userBalanceAfter = Number(svm.getBalance(user.publicKey));

    expect(walletBalance).gte(depositAmount);
    expect(userBalanceBefore - userBalanceAfter).gt(depositAmount * 0.9);
  });

  it("An user can deposit 2 times at different time!", async () => {
    const now = Math.floor(Date.now() / 1000);

    const initialClock = svm.getClock();
    initialClock.unixTimestamp = BigInt(now);
    svm.setClock(initialClock);

    const now1 = now + 60 * 60 * 24;
    const now2 = now + 60 * 60 * 24 * 2;

    const walletPDA1 = createPDA(user, program, now1);
    const walletPDA2 = createPDA(user, program, now2);

    const initializeIx1 = await program.methods
      .initializeLock(
        new anchor.BN(depositAmount),
        new anchor.BN(now1 + 60 * 60 * 24),
        new anchor.BN(now1)
      )
      .accounts({
        wallet: walletPDA1,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    const initTx1 = new anchor.web3.Transaction().add(initializeIx1);
    initTx1.recentBlockhash = svm.latestBlockhash();
    initTx1.sign(user);

    svm.sendTransaction(initTx1);

    const initializeIx2 = await program.methods
      .initializeLock(
        new anchor.BN(depositAmount),
        new anchor.BN(now2 + 60 * 60 * 24),
        new anchor.BN(now2)
      )
      .accounts({
        wallet: walletPDA2,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    const initTx2 = new anchor.web3.Transaction().add(initializeIx2);
    initTx2.recentBlockhash = svm.latestBlockhash();
    initTx2.sign(user);

    svm.sendTransaction(initTx2);

    const walletBalance1 = Number(svm.getBalance(walletPDA1));
    const walletBalance2 = Number(svm.getBalance(walletPDA2));

    expect(walletBalance1).gte(depositAmount);
    expect(walletBalance2).gte(depositAmount);
  });
});
