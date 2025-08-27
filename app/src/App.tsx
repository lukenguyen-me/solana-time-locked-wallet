import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { isUrl } from "@/lib/utils";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import Deposit from "./components/Deposit";

const rpcUrl = import.meta.env.PUBLIC_RPC_URL;
const network = isUrl(rpcUrl) ? rpcUrl : clusterApiUrl("devnet");
const wallets = [new PhantomWalletAdapter()];

function App() {
  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <Header />
        <main className="container mx-auto px-4 py-20 pt-32 lg:px-0">
          <div className="flex flex-col gap-12 lg:flex-row">
            <Card className="min-w-sm">
              <CardHeader>
                <CardTitle>Deposit</CardTitle>
                <CardDescription>
                  Deposit SOL to your time-locked wallet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Deposit />
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Your Wallets</CardTitle>
                <CardDescription>All your existing wallets.</CardDescription>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          </div>
        </main>
        <Toaster richColors />
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
