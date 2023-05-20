import { Middleware } from "../middleware"
import type { AuthOptions, Session } from "next-auth"
import type { NextApiRequest, NextApiResponse } from "next"

type RequireSession<T> = T extends true ? Session : Session | undefined

export async function withServerSession<T extends boolean>(
  authOptions: AuthOptions,
  sessionRequired: T
): Promise<Middleware<NextApiRequest, NextApiResponse, [], [RequireSession<T>]>> {
  const { getServerSession } = await import("next-auth")

  return async (req: NextApiRequest, res: NextApiResponse, next) => {
    const session = await getServerSession(req, res, authOptions)
    if (sessionRequired && !session) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    await next(session as RequireSession<T>)
  }
}
