import type { IronSession, IronSessionOptions } from "iron-session"
import { Middleware } from "../middleware"
import { IncomingMessage } from "http"
import { ServerResponse } from "http"

export function withIronSession(
  options: IronSessionOptions
): Middleware<Request | IncomingMessage, ServerResponse<IncomingMessage>, [], [IronSession]> {
  return async (req, res, next) => {
    const { getIronSession } = await import("iron-session")

    const session = await getIronSession(req, res, options)
    await next(session)
  }
}
