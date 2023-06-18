import { describe, it } from "vitest"
import { middleware, NextPipe, NextPipeResult } from "../src"

describe("middleware", () => {
  it("empty", async ({ expect }) => {
    const f = middleware<undefined, undefined>()
    expect(await f(undefined, undefined)).toBe(undefined)
  })

  it("simple", async ({ expect }) => {
    const f = middleware<undefined, undefined>().pipe(() => "Hello, World")

    expect(await f(undefined, undefined)).toBe("Hello, World")
  })

  it("provider", async ({ expect }) => {
    const f = middleware<undefined, undefined>().pipe(
      (async () => {
        return (req, res, next) => {
          return "Hello, World"
        }
      })()
    )

    expect(await f(undefined, undefined)).toBe("Hello, World")
  })

  it("simple chain", async ({ expect }) => {
    const f = middleware<undefined, undefined>()
      .pipe(async (req, res, next: NextPipe<[string]>) => {
        await next("Toshimichi")
      })
      .pipe((req, res, next, name) => {
        return "Hello, " + name
      })

    expect(await f(undefined, undefined)).toBe("Hello, Toshimichi")
  })

  it("simple error", async ({ expect }) => {
    const f = middleware<undefined, undefined>().pipe(async () => {
      throw new Error("Error!")
    })

    await expect(f(undefined, undefined)).rejects.toThrow("Error!")
  })

  it("simple error handling", async ({ expect }) => {
    let onErrorCalled = false
    const f = middleware<undefined, undefined>({
      onError: () => {
        onErrorCalled = true
      },
    }).pipe(async () => {
      throw new Error("Error!")
    })

    await expect(f(undefined, undefined)).rejects.toThrow("Error!")
    expect(onErrorCalled).toBe(true)
  })

  it("options", async ({ expect }) => {
    let onErrorCalled = false
    const f = middleware<undefined, undefined>()
      .pipe(async (req, res, next) => {
        await next()
      })
      .opts({
        onError: () => {
          onErrorCalled = true
        },
      })
      .pipe(async () => {
        throw new Error("Error!")
      })

    await expect(f(undefined, undefined)).rejects.toThrow("Error!")
    expect(onErrorCalled).toBe(true)
  })

  it("options inheritance", async ({ expect }) => {
    let onErrorCalled = false
    const f = middleware<undefined, undefined>()
      .pipe(async (req, res, next) => {
        await next()
      })
      .opts({
        onError: () => {
          onErrorCalled = true
        },
      })
      .pipe(async (req, res, next) => {
        await next()
      })
      .pipe(async () => {
        throw new Error("Error!")
      })

    await expect(f(undefined, undefined)).rejects.toThrow("Error!")
    expect(onErrorCalled).toBe(true)
  })

  it("parallel", async ({ expect }) => {
    const f = middleware<undefined, undefined>()
      .pipe(
        async (req, res, next: NextPipe<[string]>) => {
          await next("Toshimichi")
        },
        async (req, res, next: NextPipe<[string]>) => {
          await next("Hello, ")
        }
      )
      .pipe((req, res, next, name, message) => {
        return message + name
      })

    expect(await f(undefined, undefined)).toBe("Hello, Toshimichi")
  })

  it("error in parallel", async ({ expect }) => {
    let nextPipeResult: NextPipeResult | undefined = undefined
    const f = middleware<undefined, undefined>().pipe(
      async (req, res, next) => {
        nextPipeResult = await next()
      },
      async () => {
        throw new Error("Error!")
      }
    )

    await expect(f(undefined, undefined)).rejects.toThrow("Error!")
    expect(nextPipeResult).toStrictEqual({
      successful: false,
      errored: false,
      called: false,
    })
  })

  it("error in chain", async ({ expect }) => {
    let nextPipeResult: NextPipeResult | undefined = undefined
    const error = new Error("Error!")
    const f = middleware<undefined, undefined>()
      .pipe(async (req, res, next) => {
        nextPipeResult = await next()
      })
      .pipe(async () => {
        throw error
      })

    await expect(f(undefined, undefined)).rejects.toThrow("Error!")
    expect(nextPipeResult).toStrictEqual({
      successful: false,
      errored: true,
      called: true,
      error: error,
    })
  })

  it("error after next", async ({ expect }) => {
    const f = middleware<undefined, undefined>()
      .pipe(async (req, res, next) => {
        await next()
        throw new Error("Error!")
      })
      .pipe(async () => {
        return "Hello, world!"
      })

    await expect(f(undefined, undefined)).rejects.toThrow("Error!")
  })

  it("error in options", async ({ expect }) => {
    const f = middleware<undefined, undefined>({
      onError: () => {
        throw new Error("Error!")
      },
    }).pipe(() => {
      throw "Hello, world!"
    })

    await expect(f(undefined, undefined)).rejects.toThrow("Error!")
  })
})
