import { z } from "zod"
import { describe, it } from "vitest"
import {
  ExpressRequestLike,
  ExpressResponseLike,
  middleware,
  withMethods,
  withValidatedBody,
} from "../../src"
import { createExpressRequest, createExpressResponse } from "./common"

describe("withMethods", () => {
  it("get", async ({ expect }) => {
    const f = middleware<ExpressRequestLike, ExpressResponseLike>().pipe(
      withMethods(({ get, put }) => {
        get().pipe(() => {
          return "Hello, world"
        })
        put().pipe(() => {
          return "Hello, Toshimichi!"
        })
      })
    )

    expect(await f(createExpressRequest(), createExpressResponse())).toEqual("Hello, world")
  })

  it("invalid", async ({ expect }) => {
    const f = middleware<ExpressRequestLike, ExpressResponseLike>().pipe(
      withMethods(({ get, put }) => {
        get().pipe(() => {
          return "Hello, world"
        })
        put().pipe(() => {
          return "Hello, Toshimichi!"
        })
      })
    )

    const response = createExpressResponse()
    await f(createExpressRequest({ method: "POST" }), response)
    expect(response.currentStatus).toEqual(405)
  })

  it("args", async ({ expect }) => {
    const schema = z.object({
      name: z.string(),
    })

    const f = middleware<ExpressRequestLike, ExpressResponseLike>()
      .pipe(withValidatedBody(schema))
      .pipe(
        withMethods(({ put }) => {
          put().pipe((req, res, next, body) => {
            return "Hello, " + body.name
          })
        }),
      )

    expect(
      await f(createExpressRequest({ method: "PUT", body: { name: "Toshimichi" } }), createExpressResponse())
    ).toEqual("Hello, Toshimichi")
  })
})
