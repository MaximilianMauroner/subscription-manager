import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { calculateNextPaymentDate } from "~/utils/calculations";
import { sub } from "~/types/sub-type";

export const subRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      sub.extend({
        members: z.array(
          z.object({
            id: z.string().optional(),
            name: z.string(),
            share: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const interval = await ctx.db.intervalPeriod.create({
        data: {
          startDate: input.intervalPeriod.startDate,
          repeatFrequency: input.intervalPeriod.repeatFrequency,
          intervalCount: input.intervalPeriod.intervalCount,
        },
      });
      const nextPaymentDate = calculateNextPaymentDate(input);
      const sub = await ctx.db.sub.create({
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
      for (const member of input.members) {
        const memberId = member.id;
        if (!memberId) throw new TRPCError({ code: "NOT_FOUND" });
        await ctx.db.subMembers.create({
          data: {
            subId: sub.id,
            share: member.share,
            memberId: memberId,
          },
        });
      }
      return sub;
    }),
  addMember: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        share: z.number(),
        subId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      let member = await ctx.db.member.findFirst({
        where: {
          name: input.name,
          userId: ctx.session?.user?.id,
        },
      });
      if (!member) {
        member = await ctx.db.member.create({
          data: {
            name: input.name,
            userId: ctx.session?.user?.id,
          },
        });
      }
      const sub = await ctx.db.sub.findFirst({
        where: { id: input.subId },
      });
      if (!sub) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await ctx.db.subMembers.create({
        data: {
          subId: sub.id,
          share: input.share,
          memberId: member.id,
        },
      });
      return { member, sub };
    }),
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.sub.findMany({
      where: { userId: ctx.session?.user?.id },
      include: {
        subMembers: {
          include: {
            member: true,
          },
        },
        intervalPeriod: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
});
