import { ProgramIdl, type SolanaTimeLockedWallet } from "@/idl";
import { $queryClient } from "@/stores/useQueryStore";
import type { TimeLockedWallet } from "@/types/wallet";
import * as anchor from "@coral-xyz/anchor";
import { useStore } from "@nanostores/react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

const { AnchorProvider, BN, Program } = anchor;
const { PublicKey, SystemProgram } = anchor.web3;

const dummyWallet = {
  publicKey: PublicKey.default,
  signTransaction: () => {
    throw new Error("Not implemented");
  },
  signAllTransactions: () => {
    throw new Error("Not implemented");
  },
};

export const useGetUserWallets = (
  connection: anchor.web3.Connection,
  wallet?: AnchorWallet | null,
) => {
  const queryClient = useStore($queryClient);
  const provider = new AnchorProvider(connection, wallet || dummyWallet, {});
  const program = new Program<SolanaTimeLockedWallet>(
    ProgramIdl as SolanaTimeLockedWallet,
    provider,
  );

  return useQuery(
    {
      queryKey: ["wallets"],
      queryFn: async (): Promise<TimeLockedWallet[]> => {
        const wallets = await program.account.walletState.all();
        return wallets.map(
          (wallet) =>
            ({
              id: wallet.publicKey.toString(),
              amount: wallet.account.balance.toNumber(),
              unlockTime: dayjs.unix(wallet.account.unlockTimestamp.toNumber()),
              createdAt: dayjs.unix(wallet.account.createdTimestamp.toNumber()),
            }) as TimeLockedWallet,
        );
      },
      enabled: !!wallet,
    },
    queryClient,
  );
};

export const useDepositWallet = () => {
  const queryClient = useStore($queryClient);

  return useMutation(
    {
      mutationFn: async ({
        connection,
        userWallet,
        amount,
        unlockTime,
      }: {
        connection: anchor.web3.Connection;
        userWallet: AnchorWallet;
        amount: number;
        unlockTime: Date;
      }): Promise<string> => {
        const provider = new AnchorProvider(connection, userWallet, {});
        const program = new Program<SolanaTimeLockedWallet>(
          ProgramIdl as SolanaTimeLockedWallet,
          provider,
        );
        const now = Math.floor(Date.now() / 1000);
        const [walletPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("wallet"),
            userWallet.publicKey.toBuffer(),
            new anchor.BN(now).toArrayLike(Buffer, "le", 8),
          ],
          program.programId,
        );

        const signature = await program.methods
          .initializeLock(
            new BN(amount * anchor.web3.LAMPORTS_PER_SOL),
            new BN(Math.floor(unlockTime.getTime() / 1000)),
            new BN(now),
          )
          .accounts({
            wallet: walletPDA,
            user: userWallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([])
          .rpc();

        return signature;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["wallets"] });
      },
    },
    queryClient,
  );
};

export const useWithdrawWallet = () => {
  const queryClient = useStore($queryClient);

  return useMutation(
    {
      mutationFn: async ({
        connection,
        userWallet,
        wallet,
      }: {
        connection: anchor.web3.Connection;
        userWallet: AnchorWallet;
        wallet: TimeLockedWallet;
      }) => {
        const provider = new AnchorProvider(connection, userWallet, {});
        const program = new Program<SolanaTimeLockedWallet>(
          ProgramIdl as SolanaTimeLockedWallet,
          provider,
        );
        const [walletPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("wallet"),
            userWallet.publicKey.toBuffer(),
            new anchor.BN(wallet.createdAt.unix()).toArrayLike(Buffer, "le", 8),
          ],
          program.programId,
        );

        const signature = await program.methods
          .withdraw(new BN(wallet.createdAt.unix()))
          .accounts({
            wallet: walletPDA,
            user: userWallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([])
          .rpc();

        return signature;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["wallets"] });
      },
    },
    queryClient,
  );
};
