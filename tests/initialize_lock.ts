import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTimeLockedWallet } from "../target/types/solana_time_locked_wallet";
import { expect } from "chai";

describe("initialize_lock program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .solanaTimeLockedWallet as Program<SolanaTimeLockedWallet>;

  const user = anchor.web3.Keypair.generate();
  let walletPDA: anchor.web3.PublicKey;

  before(async () => {
    [walletPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("wallet"), user.publicKey.toBuffer()],
      program.programId
    );

    try {
      const airdropTx = await provider.connection.requestAirdrop(
        user.publicKey,
        anchor.web3.LAMPORTS_PER_SOL * 10
      );
      const latestBlockHash = await provider.connection.getLatestBlockhash();
      await provider.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropTx,
      });
    } catch (error) {
      console.log(error);
    }
  });

  it("User can not use passed unlock timestamp", async () => {
    const amount = anchor.web3.LAMPORTS_PER_SOL * 5;
    const unlockTimestamp = Math.floor(Date.now() / 1000) - 60 * 60 * 24;

    try {
      await program.methods
        .initializeLock(new anchor.BN(amount), new anchor.BN(unlockTimestamp))
        .accounts({
          wallet: walletPDA,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      expect.fail("Should have failed");
    } catch (error) {
      expect(error.error.errorCode.code).equal("UnlockTimestampPassed");
    }
  });

  it("User can deposit to time-locked wallet successfully!", async () => {
    const amount = anchor.web3.LAMPORTS_PER_SOL * 5;
    const unlockTimestamp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    await program.methods
      .initializeLock(new anchor.BN(amount), new anchor.BN(unlockTimestamp))
      .accounts({
        wallet: walletPDA,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const walletAccount = await program.account.timeLockedWallet.fetch(
      walletPDA
    );

    expect(walletAccount.owner).deep.equal(user.publicKey);
    expect(walletAccount.balance.toNumber()).eq(amount);
    expect(walletAccount.unlockTimestamp.toNumber()).eq(unlockTimestamp);
  });
});
