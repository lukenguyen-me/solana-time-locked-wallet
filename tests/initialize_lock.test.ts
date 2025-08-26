import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTimeLockedWallet } from "../target/types/solana_time_locked_wallet";
import { expect } from "chai";
import { LiteSVM } from "litesvm";

describe("initialize_lock program", () => {
  const program = anchor.workspace
    .solanaTimeLockedWallet as Program<SolanaTimeLockedWallet>;

  let svm: LiteSVM;
  const user = anchor.web3.Keypair.generate();
  const userInitBalance = anchor.web3.LAMPORTS_PER_SOL * 10;
  let walletPDA: anchor.web3.PublicKey;
  const depositAmount = anchor.web3.LAMPORTS_PER_SOL * 5;

  before(async () => {
    svm = new LiteSVM();
    svm.addProgramFromFile(
      program.programId,
      "./target/deploy/solana_time_locked_wallet.so"
    );

    [walletPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("wallet"), user.publicKey.toBuffer()],
      program.programId
    );

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
        new anchor.BN(unlockTimestamp)
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
        new anchor.BN(unlockTimestamp)
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
});
