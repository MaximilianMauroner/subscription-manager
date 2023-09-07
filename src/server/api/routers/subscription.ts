import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { calculateNextPaymentDate } from "~/utils/calculations";
import { subscription } from "~/types/subscription-type";

export const subscriptionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(subscription)
    .mutation(async ({ input, ctx }) => {
      const interval = await ctx.prisma.intervalPeriod.create({
        data: {
          repeatFirstDate: input.intervalPeriod.repeatFirstDate,
          repeatFlag: input.intervalPeriod.repeatFlag,
          interval: input.intervalPeriod.interval,
        },
      });
      const nextPaymentDate = calculateNextPaymentDate(input);
      return await ctx.prisma.subscription.create({
        data: {
          name: input.name,
          description: input.description,
          price: input.price,
          userId: ctx.session?.user?.id,
          lastPaymentDate: input.lastPaymentDate,
          nextPaymentDate: nextPaymentDate,
          intervalPeriodId: interval.id,
        },
      });
    }),
  addMember: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        share: z.number(),
        subscriptionId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      let member = await ctx.prisma.member.findFirst({
        where: {
          name: input.name,
          userId: ctx.session?.user?.id,
        },
      });
      if (!member) {
        member = await ctx.prisma.member.create({
          data: {
            name: input.name,
            userId: ctx.session?.user?.id,
          },
        });
      }
      const subscription = await ctx.prisma.subscription.findFirst({
        where: { id: input.subscriptionId },
      });
      if (!subscription) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await ctx.prisma.subscriptionMembers.create({
        data: {
          subscriptionId: subscription.id,
          share: input.share,
          memberId: member.id,
        },
      });
      return { member, subscription };
    }),
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.subscription.findMany({
      where: { userId: ctx.session?.user?.id },
      include: {
        subscriptionMembers: {
          include: {
            member: true,
          },
        },
        intervalPeriod: true,
      },
    });
  }),
});
