import { Middleware, NextPipe } from "../middleware"
import { ServerResponse } from "http"

/**
 * Parse the body of a request using Zod.
 */
interface ZodLike<T> {
  parse: (value: unknown) => T
}

/**
 * Parse the body of a request using Yup.
 */
interface YupLike<T> {
  cast: (value: unknown) => T
}

/**
 * Parse the body of a request using a function.
 */
type FunctionalParser<T> = (value: unknown) => T

/**
 * A parser that can be used to parse the body of a request.
 */
type Parser<T> = ZodLike<T> | YupLike<T> | FunctionalParser<T>

/**
 * Convert a parser to a functional parser.
 * @param parser The parser to convert
 * @returns A functional parser
 */
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

/**
 * Validate the body of a request, and pass it to the next middleware.
 * @param parser The parser to use
 * @returns A middleware
 */
export function withValidatedBody<TReq extends { body?: unknown }, TRes extends ServerResponse, T>(
  parser: Parser<T>
): Middleware<TReq, TRes, [], [T]> {
  const internalParser = uniformParser(parser)

  return async (req: TReq, res: TRes, next: NextPipe<[T]>) => {
    try {
      const parsed = internalParser(req.body)
      await next(parsed)
    } catch (e) {
      res.statusCode = 400
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ error: "Could not validate body" }))
    }
  }
}
