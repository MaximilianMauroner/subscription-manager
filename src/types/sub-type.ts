import { RepeatFrequency } from "@prisma/client";
import { z } from "zod";

export const interval = z.object({
  startDate: z.date(),
  repeatFrequency: z.nativeEnum(RepeatFrequency),
  intervalCount: z.number(),
  dayOfMonth: z.number().optional(),
});
export const sub = z.object({
  name: z.string(),
  description: z.string().optional(),
  intervalPeriod: interval,
  price: z.number(),
  lastPaymentDate: z.date(),
  nextPaymentDate: z.date().optional(),
});

export type SubType = z.infer<typeof sub>;
export type IntervalPeriodType = z.infer<typeof interval>;
