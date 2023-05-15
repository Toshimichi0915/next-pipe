import { MiddlewareChain, middleware } from "./middleware"

export function edgeMiddleware(): MiddlewareChain<Request, undefined, [], []> {
  return middleware<Request, undefined, []>()
}
