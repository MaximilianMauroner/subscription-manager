import { SubscriptionType } from "~/types/subscription-type";

export const calculateNextPaymentDate = (
  subscription: SubscriptionType,
): Date => {
  const startDate = subscription.lastPaymentDate;
  const nextDate = subscription.intervalPeriod.repeatFirstDate;
  return new Date();
};
