import { Middleware, NextPipe } from "../middleware"
import { ExpressRequestLike, ExpressResponseLike } from "./common-adapter"

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

export function withValidatedBody<T>(parser: Parser<T>): Middleware<ExpressRequestLike, ExpressResponseLike, [], [T]> {
  const internalParser = uniformParser(parser)

  return async (req: ExpressRequestLike, res: ExpressResponseLike, next: NextPipe<[T]>) => {
    try {
      const parsed = internalParser(req.body)
      await next(parsed)
    } catch (e) {
      res.status(400).json({ error: "Could not validate body" })
    }
  }
}
