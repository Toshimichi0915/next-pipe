import { describe, it } from "vitest"
import { z } from "zod"
import { ExpressRequestLike, ExpressResponseLike, middleware, withValidatedBody } from "../../src"
import { createExpressRequest, createExpressResponse } from "./common"

const zodSchema = z.object({
  name: z.string().min(3).max(255),
})

describe("zod", async () => {
  it("simple", async ({ expect }) => {
    const f = middleware<ExpressRequestLike, ExpressResponseLike>()
      .pipe(withValidatedBody(zodSchema))
      .pipe((req, res, next, body) => {
        return body
      })

    expect(await f(createExpressRequest({ name: "abc", age: 123 }), createExpressResponse())).toEqual({ name: "abc" })

    const response = createExpressResponse()
    await f(createExpressRequest({ age: 123 }), response)
    expect(response.currentStatus).toEqual(400)
  })
})
