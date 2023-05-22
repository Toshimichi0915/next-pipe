import { describe, it } from "vitest"
import fetch from "node-fetch"
import { z } from "zod"
import yup from "yup"
import { middleware, withValidatedBody } from "../../src"
import { IncomingMessage, ServerResponse, createServer } from "http"
import { send } from "micro"
import listen from "test-listen"

describe("withValidatedBody", () => {
  it("zod", async ({ expect }) => {
    const zodSchema = z.object({
      name: z.string(),
    })

    const server = createServer(
      middleware<IncomingMessage, ServerResponse>()
        .pipe(withValidatedBody(zodSchema))
        .pipe((req, res, next, body) => {
          send(res, 200, body)
        })
    )

    const response = await fetch(await listen(server), {
      method: "POST",
      body: JSON.stringify({ name: "abc", age: 123 }),
    }).then((res) => res.json())

    expect(response).toEqual({
      name: "abc",
    })
  })

  it("yup", async ({ expect }) => {
    const yupSchema = yup.object({
      name: yup.string().required(),
    })

    const server = createServer(
      middleware<IncomingMessage, ServerResponse>()
        .pipe(withValidatedBody(yupSchema))
        .pipe((req, res, next, body) => send(res, 200, body))
    )

    const response = await fetch(await listen(server), {
      method: "POST",
      body: JSON.stringify({ name: "abc" }),
    })

    expect(await response.json()).toEqual({
      name: "abc",
    })
  })

  it("custom", async ({ expect }) => {
    const parser = (value: unknown) => {
      if (typeof value === "string") return value + " nyoom"
      throw new Error("Invalid value")
    }

    const server = createServer(
      middleware<IncomingMessage, ServerResponse>()
        .pipe(withValidatedBody(parser))
        .pipe((req, res, next, body) => send(res, 200, body))
    )

    const response = await fetch(await listen(server), {
      method: "POST",
      body: JSON.stringify("abc"),
    })

    expect(await response.text()).toEqual("abc nyoom")
  })
})
