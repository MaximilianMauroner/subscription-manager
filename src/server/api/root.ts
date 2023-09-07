import { exampleRouter } from "~/server/api/routers/example";
import { subscriptionRouter } from "~/server/api/routers/subscription";
import { memberRouter } from "~/server/api/routers/member";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  subscription: subscriptionRouter,
  member: memberRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
