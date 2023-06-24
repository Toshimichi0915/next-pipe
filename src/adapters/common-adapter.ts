import { Middleware, MiddlewareChain, middleware } from "../middleware"
import { ServerResponse } from "http"

/**
 * A handler that can be used to define middleware for a specific HTTP method.
 */
export interface MethodHandler<TReq, TRes, TArgs extends unknown[], TRootArgs extends unknown[]> {
  /**
   * Define a middleware for the GET method.
   * @returns A middleware chain
   */
  get(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>

  /**
   * Define a middleware for the POST method.
   * @returns A middleware chain
   */
  post(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>

  /**
   * Define a middleware for the PUT method.
   * @returns A middleware chain
   */
  put(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>

  /**
   * Define a middleware for the PATCH method.
   * @returns A middleware chain
   */
  patch(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>

  /**
   * Define a middleware for the DELETE method.
   * @returns A middleware chain
   */
  del(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>

  /**
   * Define a middleware for the DELETE method.
   * @returns A middleware chain
   */
  delete(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs>
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
    del: () => createMiddleware("DELETE"),
    delete: () => createMiddleware("DELETE"),
  }

  f(handler)

  return async (req: TReq, res: TRes, next, ...args: TArgs) => {
    const result = req.method && methods[req.method.toUpperCase()]
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
