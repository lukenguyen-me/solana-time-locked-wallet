import { DateTimePicker } from "@/components/DateTimePicker";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDepositWallet } from "@/queries/wallet.query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  amount: z.number("Amount must be greater than 0").min(1),
  unlockTime: z.date(),
});

export default function Deposit() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const { mutateAsync: depositWallet } = useDepositWallet();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      unlockTime: dayjs().endOf("day").toDate(),
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!wallet) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (!connection) {
      toast.error("Solana connection not established.");
      return;
    }

    try {
      const signature = await depositWallet({
        connection,
        userWallet: wallet,
        amount: data.amount,
        unlockTime: data.unlockTime,
      });

      toast.success(
        `Initialize wallet successfully! Transaction confirmed: ${signature}`,
      );
    } catch (error) {
      toast.error(`Initialize wallet failed: ${(error as Error).message}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Fund</FormLabel>
              <FormDescription>
                Amount in SOL that you expect to raise
              </FormDescription>
              <FormControl>
                <Input
                  placeholder="100"
                  type="number"
                  {...field}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    e.target.value === ""
                      ? field.onChange("")
                      : field.onChange(Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unlockTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unlock Time</FormLabel>
              <FormDescription>
                Time when you can withdraw your funds
              </FormDescription>
              <FormControl>
                <DateTimePicker
                  placeholder="Select unlock time"
                  date={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={!wallet || form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          {form.formState.isSubmitting && <Spinner />} Send
        </Button>
      </form>
    </Form>
  );
}
