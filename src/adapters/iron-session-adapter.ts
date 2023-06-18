import type { IronSession, IronSessionOptions } from "iron-session"
import { Middleware } from "../middleware"
import { IncomingMessage } from "http"
import { ServerResponse } from "http"

/**
 * Get a iron session and pass it to the next middleware.
 * @param options the options for the iron session
 * @returns A middleware
 */
export async function withIronSession(
  options: IronSessionOptions
): Promise<Middleware<Request | IncomingMessage, ServerResponse<IncomingMessage>, [], [IronSession]>> {
  const { getIronSession } = await import("iron-session")

  return async (req, res, next) => {
    const session = await getIronSession(req, res, options)
    await next(session)
  }
}
