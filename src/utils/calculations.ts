import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import type { SubType } from "~/types/sub-type";

export const calculateNextPaymentDate = (sub: SubType): Date => {
  const last = sub.lastPaymentDate;
  const startDate = sub.intervalPeriod.startDate;

  const intervalCount = sub.intervalPeriod.intervalCount;
  const repeatFrequency = sub.intervalPeriod.repeatFrequency;
  if (repeatFrequency === "DAILY") {
    return addDays(last, intervalCount);
  } else if (repeatFrequency === "WEEKLY") {
    return addWeeks(last, intervalCount);
  } else if (repeatFrequency === "MONTHLY") {
    return addMonths(last, intervalCount);
  } else if (repeatFrequency === "YEARLY") {
    return addYears(last, intervalCount);
  } else {
    return startDate;
  }
};
