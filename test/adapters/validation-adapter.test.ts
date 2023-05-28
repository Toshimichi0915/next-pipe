import { describe, it, vitest } from "vitest"
import { z } from "zod"
import yup from "yup"
import { middleware, withValidatedBody } from "../../src"
import { ServerResponse } from "http"

describe("withValidatedBody", () => {
  const res = {
    setHeader: vitest.fn(),
    end: vitest.fn(),
  }

  it("zod", async ({ expect }) => {
    const zodSchema = z.object({
      name: z.string(),
    })

    const f = middleware<{ body: unknown }, ServerResponse>()
      .pipe(withValidatedBody(zodSchema))
      .pipe((req, res, next, body) => body)

    const result = await f({ body: { name: "abc" } }, res as never)

    expect(result).toEqual({
      name: "abc",
    })
  })

  it("yup", async ({ expect }) => {
    const yupSchema = yup.object({
      name: yup.string().required(),
    })

    const f = middleware<{ body: unknown }, ServerResponse>()
      .pipe(withValidatedBody(yupSchema))
      .pipe((req, res, next, body) => body)

    const result = await f({ body: { name: "abc" } }, res as never)

    expect(result).toEqual({
      name: "abc",
    })
  })

  it("custom", async ({ expect }) => {
    const parser = (value: unknown) => {
      if (typeof value === "string") return value + " nyoom"
      throw new Error("Invalid value")
    }

    const f = middleware<{ body: unknown }, ServerResponse>()
      .pipe(withValidatedBody(parser))
      .pipe((req, res, next, body) => body)

    const result = await f({ body: "abc" }, res as never)

    expect(result).toEqual("abc nyoom")
  })
})
