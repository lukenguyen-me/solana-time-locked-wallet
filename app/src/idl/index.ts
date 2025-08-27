import { type SolanaTimeLockedWallet as LocalSolanaTimeLockedWallet } from "./localnet/timeLockedWallet";
import localIDl from "./localnet/timeLockedWallet.json";

export const ProgramIdl =
  import.meta.env.PUBLIC_NETWORK === "localnet" ? localIDl : localIDl;

export type SolanaTimeLockedWallet = LocalSolanaTimeLockedWallet;
