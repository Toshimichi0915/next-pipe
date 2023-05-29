import { IncomingMessage, ServerResponse } from "http"
import { describe, it } from "vitest"
import { middleware, withIronSession } from "../../src"

describe("iron-session", () => {
  it("create", async ({ expect }) => {
    const req = {
      headers: {},
    }

    const res = {}

    let s: unknown
    let called = false
    const f = middleware<IncomingMessage, ServerResponse<IncomingMessage>>()
      .pipe(withIronSession({ password: "random_password_longer_than_32_characters", cookieName: "test" }))
      .pipe((req, res, next, session) => {
        s = session
        called = true
      })

    await f(req as never, res as never)
    expect(called).toBe(true)
    expect(s).toBeDefined()
  })
})
