import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTimeLockedWallet } from "../target/types/solana_time_locked_wallet";
import { expect } from "chai";
import { LiteSVM } from "litesvm";

describe("withdraw program", () => {
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

    const now = Math.floor(Date.now() / 1000);
    const unlockTimestamp = now + 60 * 60 * 24;

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
  });

  it("User can not withdraw before unlock time", async () => {
    /* Set clock to now */
    const now = Math.floor(Date.now() / 1000);
    const initialClock = svm.getClock();
    initialClock.unixTimestamp = BigInt(now);
    svm.setClock(initialClock);

    const walletBalanceBefore = Number(svm.getBalance(walletPDA));

    const withdrawIx = await program.methods
      .withdraw()
      .accounts({
        wallet: walletPDA,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    const withdrawTx = new anchor.web3.Transaction().add(withdrawIx);
    withdrawTx.recentBlockhash = svm.latestBlockhash();
    withdrawTx.sign(user);

    const simRes = await svm.simulateTransaction(withdrawTx);
    expect(simRes.toString()).include("WalletIsLocked");

    const walletBalanceAfter = Number(svm.getBalance(walletPDA));
    expect(walletBalanceAfter).eq(walletBalanceBefore);
  });

  it("User can withdraw from time-locked wallet successfully after unlock time", async () => {
    /* Set clock to next 2 days */
    const now = Math.floor(Date.now() / 1000);
    const initialClock = svm.getClock();
    initialClock.unixTimestamp = BigInt(now + 60 * 60 * 24 * 2);
    svm.setClock(initialClock);

    const walletBalanceBefore = Number(svm.getBalance(walletPDA));
    const userBalanceBefore = Number(svm.getBalance(user.publicKey));
    expect(walletBalanceBefore).gte(depositAmount);

    const withdrawIx = await program.methods
      .withdraw()
      .accounts({
        wallet: walletPDA,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    const withdrawTx = new anchor.web3.Transaction().add(withdrawIx);
    withdrawTx.recentBlockhash = svm.latestBlockhash();
    withdrawTx.sign(user);

    svm.simulateTransaction(withdrawTx);
    svm.sendTransaction(withdrawTx);

    const userBalanceAfter = Number(svm.getBalance(user.publicKey));
    const walletBalanceAfter = Number(svm.getBalance(walletPDA));

    expect(userBalanceAfter - userBalanceBefore).gt(walletBalanceBefore * 0.9);
    expect(walletBalanceAfter).eq(0);
  });
});
