import { Middleware } from "../middleware"
import type { AuthOptions, Session } from "next-auth"
import type { NextApiRequest, NextApiResponse } from "next"

type RequireSession<T> = T extends true ? Session : Session | undefined

/**
 * Get a next-auth session and pass it to the next middleware.
 * @param authOptions the options for the next-auth session
 * @param sessionRequired whether or not the session is required. If true and the session is not present, the request will be rejected with a 401
 * @returns A middleware
 */
export function withServerSession<T extends boolean>(
  authOptions: AuthOptions,
  sessionRequired: T
): Middleware<NextApiRequest, NextApiResponse, [], [RequireSession<T>]> {
  return async (req: NextApiRequest, res: NextApiResponse, next) => {
    const { getServerSession } = await import("next-auth")

    const session = await getServerSession(req, res, authOptions)
    if (sessionRequired && !session) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    await next(session as RequireSession<T>)
  }
}
