import { z } from "zod"
import { describe, it, vitest } from "vitest"
import { middleware, suppress, withMethods, withValidatedBody } from "../../src"
import { ServerResponse } from "http"

describe("withMethods", () => {
  it("get", async ({ expect }) => {
    const res = {
      setHeader: vitest.fn(),
      statusCode: 0,
      end: vitest.fn(),
    }
    const f = middleware<{ method: string }, ServerResponse>().pipe(
      withMethods(({ get, put }) => {
        get().pipe((req, res) => {
          res.end("Hello, world")
        })
        put().pipe((req, res) => {
          res.end("Hello, world")
        })
      })
    )

    await f({ method: "GET" }, res as never)
    expect(res.end.mock.calls[0][0]).toEqual("Hello, world")
  })

  it("invalid", async ({ expect }) => {
    const res = {
      setHeader: vitest.fn(),
      statusCode: 0,
      end: vitest.fn(),
    }
    const f = middleware<{ method: string }, ServerResponse>().pipe(
      withMethods(({ get, put }) => {
        get().pipe((req, res) => {
          res.end("Hello, world")
        })
        put().pipe((req, res) => {
          res.end("Hello, world")
        })
      })
    )

    await f({ method: "POST" }, res as never)

    expect(res.statusCode).toEqual(405)
  })

  it("args", async ({ expect }) => {
    const res = {
      setHeader: vitest.fn(),
      statusCode: 0,
      end: vitest.fn(),
    }
    const schema = z.object({
      name: z.string(),
    })

    const f = middleware<{ method: string; body: unknown }, ServerResponse>()
      .pipe(withValidatedBody(schema))
      .pipe(
        withMethods(({ put }) => {
          put().pipe((req, res, next, body) => {
            res.end(`Hello, ${body.name}`)
          })
        })
      )

    await f({ method: "PUT", body: { name: "Toshimichi" } }, res as never)

    expect(res.end.mock.calls[0][0]).toEqual("Hello, Toshimichi")
  })

  it("suppress", async ({ expect }) => {
    const res = {
      setHeader: vitest.fn(),
      statusCode: 0,
      end: vitest.fn(),
    }

    const schema = z.object({
      name: z.string(),
    })

    const args: unknown[] = []
    const f = middleware<{ body: unknown }, ServerResponse>()
      .pipe(suppress(withValidatedBody(schema)))
      .pipe((...rest) => {
        args.push(...rest)
      })

    await f({ body: { name: "Toshimichi" } }, res as never)
    expect(args.length).toEqual(3)

    await f({ body: undefined }, res as never)
    expect(res.statusCode).toEqual(400)
  })
})
