import { PrismaClient } from "@prisma/client";

import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends({
    query: {
      subscription: {
        async update({ model, operation, args, query }) {
          if (args.data.price) {
            const oldSubscrption =
              await globalForPrisma.prisma?.subscription.findUnique({
                where: {
                  id: args.where.id,
                },
                select: {
                  price: true,
                },
              });
            if (!oldSubscrption?.price || !args.where.id) return query(args);
            await globalForPrisma.prisma?.subscriptionPriceHistory.create({
              data: {
                subscriptionId: args.where.id,
                newPrice: +args.data.price,
                oldPrice: oldSubscrption?.price,
              },
            });
          }
          return query(args);
        },
      },
    },
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
