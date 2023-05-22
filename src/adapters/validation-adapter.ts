import { IncomingMessage } from "http"
import { Middleware, NextPipe } from "../middleware"
import { ServerResponse } from "http"
import { json, send } from "micro"

export interface ZodLike<T> {
  parse: (value: unknown) => T
}

export interface YupLike<T> {
  cast: (value: unknown) => T
}

type FunctionalParser<T> = (value: unknown) => T

type Parser<T> = ZodLike<T> | YupLike<T> | FunctionalParser<T>

function uniformParser<T>(parser: Parser<T>): FunctionalParser<T> {
  if ("parse" in parser) {
    return (value: unknown) => parser.parse(value)
  } else if ("cast" in parser) {
    return (value: unknown) => parser.cast(value)
  } else if (typeof parser === "function") {
    return parser
  }

  throw new Error("Invalid parser")
}

export function withValidatedBody<TReq extends IncomingMessage, TRes extends ServerResponse, T>(
  parser: Parser<T>
): Middleware<TReq, TRes, [], [T]> {
  const internalParser = uniformParser(parser)

  return async (req: TReq, res: TRes, next: NextPipe<[T]>) => {
    try {
      const parsed = internalParser(await json(req))
      await next(parsed)
    } catch (e) {
      send(res, 400, { error: "Could not validate body" })
    }
  }
}
