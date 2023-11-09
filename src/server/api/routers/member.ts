import { createTRPCRouter, protectedProcedure } from "../trpc";

export const memberRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.member.findMany({
      where: {
        userId: ctx.session?.user?.id,
      },
    });
  }),
});
