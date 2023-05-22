import { z } from "zod"
import { describe, it } from "vitest"
import { middleware, withMethods, withValidatedBody } from "../../src"
import { IncomingMessage, ServerResponse, createServer } from "http"
import { send } from "micro"
import fetch from "node-fetch"
import listen from "test-listen"

describe("withMethods", () => {
  it("get", async ({ expect }) => {
    const server = createServer(
      middleware<IncomingMessage, ServerResponse>().pipe(
        withMethods(({ get, put }) => {
          get().pipe((req, res) => {
            send(res, 200, "Hello, world")
          })
          put().pipe((req, res) => {
            send(res, 200, "Hello, Toshimichi")
          })
        })
      )
    )

    const response = await fetch(await listen(server), {
      method: "GET",
    }).then((res) => res.text())

    expect(response).toEqual("Hello, world")
  })

  it("invalid", async ({ expect }) => {
    const server = createServer(
      middleware<IncomingMessage, ServerResponse>().pipe(
        withMethods(({ get, put }) => {
          get().pipe((req, res) => {
            send(res, 200, "Hello, world")
          })
          put().pipe((req, res) => {
            send(res, 200, "Hello, Toshimichi")
          })
        })
      )
    )

    const response = await fetch(await listen(server), {
      method: "POST",
    })

    expect(response.status).toEqual(405)
  })

  it("args", async ({ expect }) => {
    const schema = z.object({
      name: z.string(),
    })

    const server = createServer(
      middleware<IncomingMessage, ServerResponse>()
        .pipe(withValidatedBody(schema))
        .pipe(
          withMethods(({ put }) => {
            put().pipe((req, res, next, body) => {
              send(res, 200, "Hello, " + body.name)
            })
          })
        )
    )

    const response = await fetch(await listen(server), {
      method: "PUT",
      body: JSON.stringify({ name: "Toshimichi" }),
    })

    expect(await response.text()).toEqual("Hello, Toshimichi")
  })
})
