import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const memberRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.member.findMany({
      where: {
        userId: ctx.session?.user?.id,
      },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.member.create({
        data: {
          name: input.name,
          userId: ctx.session?.user?.id,
        },
      });
    }),
});
