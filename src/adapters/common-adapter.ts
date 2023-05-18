import { MiddlewareChain, middleware } from "../middleware"

export interface ExpressRequestLike {
  body: unknown
}

export interface ExpressResponseLike {
  status: (code: number) => ExpressResponseLike
  json: (body: unknown) => ExpressResponseLike
}

export function edgeMiddleware(): MiddlewareChain<Request, undefined, [], []> {
  return middleware<Request, undefined, []>()
}
