/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server"
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

  const f12 = middleware<NextApiRequest, NextApiResponse, [boolean]>()
    .pipe(async (req, res, next: NextPipe<[Session | undefined]>, sessionRequired) => {
      const middleware = await withServerSession(authOptions, sessionRequired)
      await middleware(req, res, next)
    })
    .pipe((req, res, next, sessionRequired, session) => {
      res.status(200).json({ message: "Hello, world" })
      return `Hello, world ${session?.user?.name}`
    })

  const f13 = middleware<Request, undefined, [boolean]>().pipe(
    async (req, res, next: NextPipe<[Session | undefined]>, sessionRequired) => {
      const middleware = await withServerSession(authOptions, sessionRequired)
      await middleware(req, res, next)
    }
  )

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

    expect(await f12(req as any, res as any, true)).toEqual(undefined)
    expect(await f12(req as any, res as any, false)).toEqual("Hello, world undefined")
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
    spy.mockReturnValue(mock as any)

    expect(await f12(req as any, res as any, true)).toEqual("Hello, world Toshimichi")
    expect(await f12(req as any, res as any, false)).toEqual("Hello, world Toshimichi")
  })
})
