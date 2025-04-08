/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, vitest } from "vitest"
import { z } from "zod"
import yup from "yup"
import superstruct from "superstruct"
import { middleware, withValidatedBody } from "../../src"
import { ServerResponse } from "http"

describe("withValidatedBody", () => {
  it("zod", async ({ expect }) => {
    const res = {
      setHeader: vitest.fn(),
      end: vitest.fn(),
    }

    const zodSchema = z.object({
      name: z.string(),
    })

    const f = middleware<{ body: unknown }, ServerResponse>()
      .pipe(withValidatedBody(zodSchema))
      .pipe((req, res, next, body) => body)

    const result = await f({ body: { name: "abc" } }, res as any)

    expect(result).toEqual({
      name: "abc",
    })
  })

  it("yup", async ({ expect }) => {
    const res = {
      setHeader: vitest.fn(),
      end: vitest.fn(),
    }

    const yupSchema = yup.object({
      name: yup.string().required(),
    })

    const f = middleware<{ body: unknown }, ServerResponse>()
      .pipe(withValidatedBody(yupSchema))
      .pipe((req, res, next, body) => body)

    const result = await f({ body: { name: "abc" } }, res as any)

    expect(result).toEqual({
      name: "abc",
    })
  })

  it("superstruct", async ({ expect }) => {
    const res = {
      setHeader: vitest.fn(),
      end: vitest.fn(),
    }

    const schema = superstruct.object({
      name: superstruct.string(),
    })

    const f = middleware<{ body: unknown }, ServerResponse>()
      .pipe(withValidatedBody(schema))
      .pipe((req, res, next, body) => body)

    const result = await f({ body: { name: "abc" } }, res as any)

    expect(result).toEqual({
      name: "abc",
    })
  })

  it("zod invalid", async ({ expect }) => {
    const res = {
      setHeader: vitest.fn(),
      statusCode: 200,
      end: vitest.fn(),
    }

    const schema = z.object({
      name: z.string(),
    })

    const f = middleware<{ body: unknown }, ServerResponse>()
      .pipe(withValidatedBody(schema))
      .pipe((req, res, next, body) => body)

    await f({ body: { name: 123 } }, res as any)

    expect(res.statusCode).toEqual(400)
  })

  it("yup invalid", async ({ expect }) => {
    const res = {
      setHeader: vitest.fn(),
      statusCode: 0,
      end: vitest.fn(),
    }

    const schema = yup.object({
      name: yup.string().required(),
    })

    const f = middleware<{ body: unknown }, ServerResponse>()
      .pipe(withValidatedBody(schema))
      .pipe((req, res, next, body) => body)

    await f({ body: { age: "heheheha" } }, res as any)

    expect(res.statusCode).toEqual(400)
  })

  it("superstruct invalid", async ({ expect }) => {
    const res = {
      setHeader: vitest.fn(),
      statusCode: 0,
      end: vitest.fn(),
    }

    const schema = superstruct.object({
      name: superstruct.string(),
    })

    const f = middleware<{ body: unknown }, ServerResponse>()
      .pipe(withValidatedBody(schema))
      .pipe((req, res, next, body) => body)

    await f({ body: { age: "heheheha" } }, res as any)

    expect(res.statusCode).toEqual(400)
  })

  it("custom", async ({ expect }) => {
    const res = {
      setHeader: vitest.fn(),
      end: vitest.fn(),
    }

    const parser = (value: unknown) => {
      if (typeof value === "string") return value + " nyoom"
      throw new Error("Invalid value")
    }

    const f = middleware<{ body: unknown }, ServerResponse>()
      .pipe(withValidatedBody(parser))
      .pipe((req, res, next, body) => body)

    const result = await f({ body: "abc" }, res as any)

    expect(result).toEqual("abc nyoom")
  })

  it("Web API", async ({ expect }) => {
    const req = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ name: "abc" }),
    })

    const schema = z.object({
      name: z.string(),
    })

    const f = middleware<Request, undefined>()
      .pipe(withValidatedBody(schema))
      .pipe((req, res, next, body) => {
        return new Response(JSON.stringify(body))
      })

    const res = (await f(req, undefined)) as Response
    expect(await res.json()).toEqual({ name: "abc" })
    expect(res.status).toEqual(200)
  })

  it("Web API (invalid)", async ({ expect }) => {
    const req = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ baka: "abc" }),
    })

    const schema = z.object({
      name: z.string(),
    })

    const f = middleware<Request, undefined>()
      .pipe(withValidatedBody(schema))
      .pipe((req, res, next, body) => {
        return new Response(JSON.stringify(body))
      })

    const res = (await f(req, undefined)) as Response
    expect(res.status).toEqual(400)
  })
})
