import ConnectWallet from "@/components/ConnectWallet";

export default function Header() {
  return (
    <header className="bg-background fixed top-0 h-20 w-full border-b">
      <div className="container mx-auto flex h-full items-center justify-between px-4 lg:px-0">
        <span className="font-mono text-lg font-bold uppercase">
          Time-Locked <br className="lg:hidden" />
          Wallet
        </span>
        <div className="flex items-center">
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
