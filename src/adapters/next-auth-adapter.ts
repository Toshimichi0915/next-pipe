import { Middleware, NextPipe } from "../middleware"
import type { AuthOptions, Session } from "next-auth"
import type { NextApiRequest, NextApiResponse } from "next"

type RequireSession<T> = T extends true ? Session : Session | undefined

/**
 * Get a next-auth session and pass it to the next middleware.
 * @param authOptions the options for the next-auth session
 * @param sessionRequired whether or not the session is required. If true and the session is not present, the request will be rejected with a 401
 * @returns A middleware
 */
export async function withServerSession<TRequireSession extends boolean>(
  authOptions: AuthOptions,
  sessionRequired: TRequireSession
): Promise<
  Middleware<NextApiRequest, NextApiResponse, [], [RequireSession<TRequireSession>]> &
    Middleware<unknown, undefined, [], [RequireSession<TRequireSession>]>
> {
  const { getServerSession } = await import("next-auth")

  return async (req: unknown, res: NextApiResponse | undefined, next) => {
    let session: Session | null
    if (res) {
      session = await getServerSession(req as NextApiRequest, res, authOptions)
      if (sessionRequired && !session) {
        res.status(401).json({ error: "Unauthorized" })
        return
      }
    } else {
      // web API
      session = await getServerSession(authOptions)
      if (sessionRequired && !session) {
        return new Response("Unauthorized", { status: 401 })
      }
    }

    await (next as NextPipe<[RequireSession<TRequireSession>]>)(session as RequireSession<TRequireSession>)
  }
}
