import { describe, it } from "vitest"
import { ExpressRequestLike, ExpressResponseLike, middleware, withMethods } from "../../src"
import { createExpressRequest, createExpressResponse } from "./common"

describe("withMethods", () => {
  it("get", async ({ expect }) => {
    const f = middleware<ExpressRequestLike, ExpressResponseLike>().pipe(
      withMethods({
        GET: () => {
          return "Hello, world"
        },
      })
    )

    expect(await f(createExpressRequest(), createExpressResponse())).toEqual("Hello, world")
  })

  it("invalid", async ({ expect }) => {
    const f = middleware<ExpressRequestLike, ExpressResponseLike>().pipe(
      withMethods({
        GET: () => {
          return "Hello, world"
        },
      })
    )

    const response = createExpressResponse()
    await f(createExpressRequest({ method: "POST" }), response)
    expect(response.currentStatus).toEqual(405)
  })
})
