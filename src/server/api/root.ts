import { createTRPCRouter } from "~/server/api/trpc";
import { subRouter } from "./routers/sub";
import { memberRouter } from "./routers/member";
import { postRouter } from "./routers/post";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  sub: subRouter,
  member: memberRouter,
  post: postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
