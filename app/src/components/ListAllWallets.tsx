import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  convertLamportsToSol,
  formatMoney,
  truncateWalletAddress,
} from "@/lib/utils";
import { useGetAllWallets, useWithdrawWallet } from "@/queries/wallet.query";
import type { TimeLockedWallet } from "@/types/wallet";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { HandCoins } from "lucide-react";
import { toast } from "sonner";

export default function ListAllWallets() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const { data: allWallets, isLoading } = useGetAllWallets(connection);

  const { mutateAsync: withdrawWallet } = useWithdrawWallet();

  const onWithdraw = async (timeLockedWallet: TimeLockedWallet) => {
    if (!wallet) return;
    try {
      const signature = await withdrawWallet({
        connection,
        userWallet: wallet,
        wallet: timeLockedWallet,
      });
      toast.success(
        `Withdraw successfully! Transaction confirmed: ${signature}`,
      );
    } catch (error) {
      toast.error(`Withdraw failed: ${(error as Error).message}`);
    }
  };

  return (
    <Table>
      {isLoading && (
        <TableCaption>
          {" "}
          <Spinner />
        </TableCaption>
      )}
      <TableHeader>
        <TableRow className="font-mono">
          <TableHead className="text-muted-foreground">Wallet</TableHead>
          <TableHead className="text-muted-foreground text-center">
            Balance
          </TableHead>
          <TableHead className="text-muted-foreground text-center">
            Unlock Time
          </TableHead>
          <TableHead className="text-muted-foreground text-center">
            Created At
          </TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {allWallets &&
          allWallets.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{truncateWalletAddress(e.id)}</TableCell>
              <TableCell className="text-center">
                {formatMoney(convertLamportsToSol(e.amount))} SOL
              </TableCell>
              <TableCell className="text-center">
                {e.unlockTime.format("DD-MM-YYYY HH:mm:ss")}
              </TableCell>
              <TableCell className="text-center">
                {e.createdAt.format("DD-MM-YYYY HH:mm:ss")}
              </TableCell>
              <TableCell className="text-right">
                {e.owner === wallet?.publicKey.toBase58() && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onWithdraw(e)}
                  >
                    <HandCoins />
                    Withdraw
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
