import { Middleware, NextPipe } from "../middleware"
import { ExpressRequestLike, ExpressResponseLike } from "./common-adapter"

export interface ZodLike<T> {
  parse: (value: unknown) => T
}

export interface YupLike<T> {
  validate: (value: unknown) => T
}

type Parser<T> = ZodLike<T> | YupLike<T>

type InternalParser<T> = (value: unknown) => T

function convertInternal<T>(parser: Parser<T>): InternalParser<T> {
  if ("parse" in parser) {
    return (value: unknown) => parser.parse(value)
  } else if ("validate" in parser) {
    return (value: unknown) => parser.validate(value)
  }

  throw new Error("Invalid parser")
}

export function withValidatedBody<T>(parser: Parser<T>): Middleware<ExpressRequestLike, ExpressResponseLike, [], [T]> {
  const internalParser = convertInternal(parser)

  return async (req: ExpressRequestLike, res: ExpressResponseLike, next: NextPipe<[T]>) => {
    try {
      const parsed = internalParser(req.body)
      await next(parsed)
    } catch (e) {
      res.status(400).json({ error: "Could not validate body" })
    }
  }
}
