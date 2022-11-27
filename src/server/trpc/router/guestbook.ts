import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";

export const guestbookRouter = router({
  // getAll query to get all messages, publicProcedure means doesn't have to be authed, ctx param is checking auth and prisma schema
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      // find all messages in guestbook and return the name and message, order by decending creation
      return await ctx.prisma.guestbook.findMany({
        select: {
          name: true,
          message: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      console.log("error", error)
    }
  }),
  // postMessage name of query, protectProcedure - user muct be signed in
  postMessage: protectedProcedure
    // checking for incomeing object with name and message
    .input(
      z.object({
        name: z.string(),
        message: z.string(),
      })
    )
    // mutation takes the context of the session(auth) and context of prisma schema and the incoming input
    .mutation(async ({ ctx, input }) => {
      try {
        // mutate the guestbook database by creating a new datatable with the inputname and input message
        await ctx.prisma.guestbook.create({
          data: {
            name: input.name,
            message: input.message,
          },
        });
      } catch (error) {
        console.log(error);
      }
    })
})