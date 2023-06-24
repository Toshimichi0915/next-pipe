import { Middleware, MiddlewareChain, middleware } from "../middleware"
import { ServerResponse } from "http"

// the list of all HTTP methods
// https://github.com/for-GET/know-your-http-well/blob/master/methods.md
const methods = [
  // common
  "CONNECT",
  "DELETE",
  "GET",
  "HEAD",
  "OPTIONS",
  "POST",
  "PUT",
  "TRACE",

  // registered
  "ACL",
  "BASELINE",
  "BIND",
  "CHECKIN",
  "RFC3253",
  "CHECKOUT",
  "RFC3253",
  "COPY",
  "LABEL",
  "LINK",
  "LOCK",
  "MERGE",
  "MKACTIVITY",
  "MKCALENDAR",
  "MKCOL",
  "MKREDIRECTREF",
  "MKWORKSPACE",
  "MOVE",
  "ORDERPATCH",
  "PATCH",
  "PROPFIND",
  "PROPPATCH",
  "REBIND",
  "REPORT",
  "SEARCH",
  "UNBIND",
  "UNCHECKOUT",
  "UNLINK",
  "UNLOCK",
  "UPDATE",
  "UPDATEREDIRECTREF",
  "VERSION",

  // delete is a keyword in JavaScript, so we use DEL instead
  "DEL",
] as const

/**
 * A handler that can be used to define middleware for a specific HTTP method.
 */
export type MethodHandler<TReq, TRes, TArgs extends unknown[], TRootArgs extends unknown[]> = {
  [K in Lowercase<(typeof methods)[number]>]: () => MiddlewareChain<TReq, TRes, TArgs, TRootArgs>
}

/**
 * Define middlewares for specific HTTP methods.
 * @param f A function that receives a handler that can be used to define middleware for specific HTTP methods
 * @returns A middleware
 */
export function withMethods<
  TReq extends { method?: string | undefined },
  TRes extends ServerResponse,
  TArgs extends unknown[]
>(f: (handler: MethodHandler<TReq, TRes, TArgs, TArgs>) => unknown): Middleware<TReq, TRes, TArgs> {
  const registry: { [key in string]?: MiddlewareChain<TReq, TRes, TArgs, TArgs> } = {}

  const createMiddleware = (method: string) => {
    let current = registry[method]
    if (current) throw new Error(`Method ${method} already defined`)
    current = middleware<TReq, TRes, TArgs>()
    registry[method] = current
    return current
  }

  const handler: Partial<MethodHandler<TReq, TRes, TArgs, TArgs>> = {}

  for (const method of methods) {
    if (method === "DEL") {
      handler.del = () => createMiddleware("DELETE")
      continue
    }

    handler[method.toLowerCase() as Lowercase<typeof method>] = () => createMiddleware(method)
  }

  f(handler as MethodHandler<TReq, TRes, TArgs, TArgs>)

  return async (req: TReq, res: TRes, next, ...args: TArgs) => {
    const result = req.method && registry[req.method.toUpperCase()]
    if (result) {
      return result(req, res, ...args)
    } else {
      res.statusCode = 405
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ error: "Method not allowed" }))
    }
  }
}

export function suppress<TReq, TRes, TArgs extends unknown[]>(
  middleware: Middleware<TReq, TRes, TArgs, unknown[]>
): Middleware<TReq, TRes, TArgs, []> {
  return async (req, res, next, ...args) => {
    return await middleware(req, res, () => next(), ...args)
  }
}
