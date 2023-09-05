import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { IntervalPeriod, RepeatFrequency, Subscription } from "@prisma/client";
import { TRPCError } from "@trpc/server";
const interval = z.object({
  repeatFirstDate: z.date(),
  repeatFlag: z.nativeEnum(RepeatFrequency),
  interval: z.number(),
  monthDay: z.number().optional(),
});
const subscription = z.object({
  name: z.string(),
  intervalPeriod: interval,
  price: z.number(),
  lastPaymentDate: z.date(),
});

export const subscriptionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(subscription)
    .mutation(async ({ input, ctx }) => {
      console.log(input);
      if (!ctx.session?.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const interval = await ctx.prisma.intervalPeriod.create({
        data: {
          repeatFirstDate: input.intervalPeriod.repeatFirstDate,
          repeatFlag: input.intervalPeriod.repeatFlag,
          interval: input.intervalPeriod.interval,
        },
      });
      console.log(interval);

      return await ctx.prisma.subscription.create({
        data: {
          name: input.name,
          price: input.price,
          userId: ctx.session?.user?.id,
          lastPaymentDate: input.lastPaymentDate,
          intervalPeriodId: interval.id,
        },
      });
    }),
});

const calculateNextDate = (
  subscription: Subscription & {
    intervalPeriod: IntervalPeriod;
  },
) => {
  // subscription.intervalPeriod.repeatFirstDate   0
};
