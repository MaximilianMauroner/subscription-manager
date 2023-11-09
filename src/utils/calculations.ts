import { SubType } from "~/types/sub-type";

export const calculateNextPaymentDate = (sub: SubType): Date => {
  const startDate = sub.lastPaymentDate;
  const nextDate = sub.intervalPeriod.repeatFirstDate;
  return new Date();
};
