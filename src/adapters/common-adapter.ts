import { Middleware, MiddlewareChain, createFakeMiddlewareChain, middleware } from "../middleware"

export interface ExpressRequestLike {
  body: unknown
  method?: string
}

export interface ExpressResponseLike {
  status(code: number): unknown
  json(body: unknown): unknown
}

export interface MethodHandler<TReq, TRes, TArgs extends unknown[], TRootArgs extends unknown[]> {
  get(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>
  post(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>
  put(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>
  patch(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>
  delete(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>
}

export function withMethods<TReq extends ExpressRequestLike, TRes extends ExpressResponseLike, TArgs extends unknown[]>(
  f: (handler: MethodHandler<TReq, TRes, TArgs, TArgs>) => unknown
): Middleware<TReq, TRes, TArgs> {
  return async (req: TReq, res: TRes, next, ...args: TArgs) => {
    let result: MiddlewareChain<TReq, TRes, TArgs, TArgs> | undefined

    const createMiddleware = (method: string) => {
      if (req.method !== method) return createFakeMiddlewareChain<TReq, TRes, TArgs, unknown[], TArgs>()
      if (result) throw new Error(`Method ${method} already defined`)
      result = middleware<TReq, TRes, TArgs>()
      return result
    }

    const handler: MethodHandler<TReq, TRes, TArgs, TArgs> = {
      get: () => createMiddleware("GET"),
      post: () => createMiddleware("POST"),
      put: () => createMiddleware("PUT"),
      patch: () => createMiddleware("PATCH"),
      delete: () => createMiddleware("DELETE"),
    }

    f(handler)

    if (result) {
      return result(req, res, ...args)
    } else {
      res.status(405)
      res.json({ error: "Method not allowed" })
    }
  }
}
