import { IncomingMessage } from "http"
import { Middleware, MiddlewareChain, middleware } from "../middleware"
import { ServerResponse } from "http"
import { send } from "micro"

export interface MethodHandler<TReq, TRes, TArgs extends unknown[], TRootArgs extends unknown[]> {
  get(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>
  post(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>
  put(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>
  patch(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>
  delete(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>
}

export function withMethods<TReq extends IncomingMessage, TRes extends ServerResponse, TArgs extends unknown[]>(
  f: (handler: MethodHandler<TReq, TRes, TArgs, TArgs>) => unknown
): Middleware<TReq, TRes, TArgs> {
  const methods: { [key in string]?: MiddlewareChain<TReq, TRes, TArgs, TArgs> } = {}

  const createMiddleware = (method: string) => {
    let current = methods[method]
    if (current) throw new Error(`Method ${method} already defined`)
    current = middleware<TReq, TRes, TArgs>()
    methods[method] = current
    return current
  }

  const handler: MethodHandler<TReq, TRes, TArgs, TArgs> = {
    get: () => createMiddleware("GET"),
    post: () => createMiddleware("POST"),
    put: () => createMiddleware("PUT"),
    patch: () => createMiddleware("PATCH"),
    delete: () => createMiddleware("DELETE"),
  }

  f(handler)

  return async (req: TReq, res: TRes, next, ...args: TArgs) => {
    const result = req.method && methods[req.method]
    if (result) {
      return result(req, res, ...args)
    } else {
      send(res, 405, { error: "Method not allowed" })
    }
  }
}
