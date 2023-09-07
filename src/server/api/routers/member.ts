import { createTRPCRouter, protectedProcedure } from "../trpc";

export const memberRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.member.findMany({
      where: {
        userId: ctx.session?.user?.id,
      },
    });
  }),
});
