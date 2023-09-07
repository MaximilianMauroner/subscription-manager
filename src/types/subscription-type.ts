import { RepeatFrequency } from "@prisma/client";
import { z } from "zod";

export const interval = z.object({
  repeatFirstDate: z.date(),
  repeatFlag: z.nativeEnum(RepeatFrequency),
  interval: z.number(),
  monthDay: z.number().optional(),
});
export const subscription = z.object({
  name: z.string(),
  description: z.string().optional(),
  intervalPeriod: interval,
  price: z.number(),
  lastPaymentDate: z.date(),
});

export type SubscriptionType = z.infer<typeof subscription>;
export type IntervalPeriodType = z.infer<typeof interval>;
