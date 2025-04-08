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
 * Parse the body of a request using Superstruct.
 */
interface SuperstructLike<T> {
  create: (value: unknown) => T
}

/**
 * Parse the body of a request using a function.
 */
type FunctionalParser<T> = (value: unknown) => T

/**
 * A parser that can be used to parse the body of a request.
 */
type Parser<T> = ZodLike<T> | YupLike<T> | SuperstructLike<T> | FunctionalParser<T>

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
  } else if ("create" in parser) {
    return (value: unknown) => parser.create(value)
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
export function withValidatedBody<
  TReq extends { body?: unknown } | { json(): unknown },
  TRes extends ServerResponse | null | undefined,
  T
>(parser: Parser<T>): Middleware<TReq, TRes, [], [T]> {
  const internalParser = uniformParser(parser)

  return async (req: TReq, res: TRes, next: NextPipe<[T]>) => {
    try {
      let parsed: T
      if ("json" in req) {
        parsed = internalParser(await req.json())
      } else if ("body" in req) {
        parsed = internalParser(req.body)
      } else {
        throw new Error("The request does not have a body or a json method")
      }
      await next(parsed)
    } catch (e) {
      if (res) {
        res.statusCode = 400
        res.setHeader("Content-Type", "application/json")
        res.end(JSON.stringify({ error: "Could not validate body" }))
      } else {
        return new Response(JSON.stringify({ error: "Could not validate body" }), { status: 400 })
      }
    }
  }
}
