import { describe, it } from "vitest"
import { z } from "zod"
import yup from "yup"
import { ExpressRequestLike, ExpressResponseLike, middleware, withValidatedBody } from "../../src"
import { createExpressRequest, createExpressResponse } from "./common"

describe("validation", () => {
  it("zod", async ({ expect }) => {
    const zodSchema = z.object({
      name: z.string(),
    })
    const f = middleware<ExpressRequestLike, ExpressResponseLike>()
      .pipe(withValidatedBody(zodSchema))
      .pipe((req, res, next, body) => body)

    expect(await f(createExpressRequest({ name: "abc", age: 123 }), createExpressResponse())).toEqual({ name: "abc" })

    const response = createExpressResponse()
    await f(createExpressRequest({ age: 123 }), response)
    expect(response.currentStatus).toEqual(400)
  })

  it("yup", async ({ expect }) => {
    const yupSchema = yup.object({
      name: yup.string().required(),
    })

    const f = middleware<ExpressRequestLike, ExpressResponseLike>()
      .pipe(withValidatedBody(yupSchema))
      .pipe((req, res, next, body) => body)

    expect(await f(createExpressRequest({ name: "abc" }), createExpressResponse())).toEqual({ name: "abc" })

    const response = createExpressResponse()
    await f(createExpressRequest({ age: 123 }), response)
    expect(response.currentStatus).toEqual(400)
  })

  it("custom", async ({ expect }) => {
    const parser = (value: unknown) => {
      if (typeof value === "string") return value + " nyoom"
      throw new Error("Invalid value")
    }

    const f = middleware<ExpressRequestLike, ExpressResponseLike>()
      .pipe(withValidatedBody(parser))
      .pipe((req, res, next, body) => body)

    expect(await f(createExpressRequest("abc"), createExpressResponse())).toEqual("abc nyoom")

    const response = createExpressResponse()
    await f(createExpressRequest(123), response)
    expect(response.currentStatus).toEqual(400)
  })
})
