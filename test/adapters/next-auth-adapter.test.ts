import { NextApiRequest, NextApiResponse } from "next"
import { afterAll, beforeAll, describe, it, vitest } from "vitest"
import { NextPipe, middleware, withServerSession } from "../../src"
import core from "next-auth/core"
import { AuthOptions, Session } from "next-auth"

beforeAll(() => {
  process.env.NEXTAUTH_URL = "http://localhost:3000"
})

afterAll(() => {
  delete process.env.NEXTAUTH_URL
})

describe("next-auth", () => {
  const authOptions = {
    providers: [],
    secret: "secret",
  } as AuthOptions

  const f = middleware<NextApiRequest, NextApiResponse, [boolean]>()
    .pipe(async (req, res, next: NextPipe<[Session | undefined]>, sessionRequired) => {
      const middleware = await withServerSession(authOptions, sessionRequired)
      await middleware(req, res, next)
    })
    .pipe((req, res, next, sessionRequired, session) => {
      res.status(200).json({ message: "Hello, world" })
      return `Hello, world ${session?.user?.name}`
    })

  it("no session", async ({ expect }) => {
    const req = { headers: {} }
    const res = {
      setHeader: vitest.fn(),
      getHeader: vitest.fn(),
      status: vitest.fn(),
      json: vitest.fn(),
    }

    res.status.mockReturnValue(res)
    res.json.mockReturnValue(res)

    expect(await f(req as never, res as never, true)).toEqual(undefined)
    expect(await f(req as never, res as never, false)).toEqual("Hello, world undefined")
    expect(res.status.mock.calls[0][0]).toEqual(401)
    expect(res.status.mock.calls[1][0]).toEqual(200)
  })

  it("session", async ({ expect }) => {
    const req = { headers: {} }
    const res = {
      setHeader: vitest.fn(),
      getHeader: vitest.fn(),
      status: vitest.fn(),
      json: vitest.fn(),
    }

    res.status.mockReturnValue(res)
    res.json.mockReturnValue(res)

    const mock = {
      body: {
        user: {
          name: "Toshimichi",
          email: "test@example.com",
          image: "",
          id: "1234",
        },
        expires: "",
      },
    }

    const spy = vitest.spyOn(core, "AuthHandler")
    spy.mockReturnValue(mock as never)

    expect(await f(req as never, res as never, true)).toEqual("Hello, world Toshimichi")
    expect(await f(req as never, res as never, false)).toEqual("Hello, world Toshimichi")
  })
})
