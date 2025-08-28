import dayjs from "dayjs";

export type TimeLockedWallet = {
  id: string;
  owner: string;
  amount: number;
  unlockTime: dayjs.Dayjs;
  createdAt: dayjs.Dayjs;
};
