import express from "express"
import { middleware, MiddlewareChain } from "next-pipe"

export function expressMiddleware(): MiddlewareChain<express.Request, express.Response, [], []> {
  return middleware<express.Request, express.Response, []>()
}
