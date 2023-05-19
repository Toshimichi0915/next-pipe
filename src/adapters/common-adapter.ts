import { Middleware } from "../middleware"

export interface ExpressRequestLike {
  body: unknown
  method?: string
}

export interface ExpressResponseLike {
  status(code: number): unknown
  json(body: unknown): unknown
}

export type AvailableMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type MethodOption<TReq, TRes, TArgs extends unknown[]> = (req: TReq, res: TRes, ...args: TArgs) => unknown

export type MethodOptions<TReq, TRes, TArgs extends unknown[]> = {
  [key in AvailableMethods]?: MethodOption<TReq, TRes, TArgs>
}

export function withMethods<TReq extends ExpressRequestLike, TRes extends ExpressResponseLike, TArgs extends unknown[]>(
  options: MethodOptions<TReq, TRes, TArgs>
): Middleware<TReq, TRes, TArgs> {
  return async (req: TReq, res: TRes, next, ...args: TArgs) => {
    const methodOption = options[req.method as AvailableMethods]

    if (methodOption) {
      return await methodOption(req, res, ...args)
    } else {
      res.status(405)
      res.json({ error: "Method not allowed" })
    }
  }
}
