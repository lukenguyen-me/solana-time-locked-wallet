import Deposit from "@/components/Deposit";
import Header from "@/components/Header";
import ListAllWallets from "@/components/ListAllWallets";
import ListWallets from "@/components/ListWallets";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

const rpcUrl = import.meta.env.VITE_RPC_URL;
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
              <CardContent>
                <Tabs defaultValue="all-wallets">
                  <TabsList>
                    <TabsTrigger value="all-wallets">All Wallets</TabsTrigger>
                    <TabsTrigger value="my-wallets">My Wallets</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all-wallets">
                    <ListAllWallets />
                  </TabsContent>
                  <TabsContent value="my-wallets">
                    <ListWallets />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
        <Toaster richColors />
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
