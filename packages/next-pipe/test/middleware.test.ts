import { NextPipe, middleware } from "../src"
import { describe, it } from "vitest"

describe("control-flow", () => {
  it("simple", async ({ expect }) => {
    const array: number[] = []
    const f = middleware<undefined, undefined, []>()
      .pipe(
        async (req, res, next: NextPipe<[number]>) => {
          array.push(0)
          await next(2)
          array.push(5)
        },
        async (req, res, next: NextPipe<[number]>) => {
          array.push(1)
          await next(3)
          array.push(4)
        }
      )
      .pipe((req, res, next, a, b) => {
        array.push(a)
        array.push(b)
      })

    await f(undefined, undefined)
    expect(array).toEqual([0, 1, 2, 3, 4, 5])
  })

  it("error", async ({ expect }) => {
    const array: number[] = []
    const f = middleware<undefined, undefined, []>({
      onError: async () => {
        array.push(4)
      },
    })
      .pipe(
        async (req, res, next: NextPipe<[number]>) => {
          array.push(0)
          await next(2)
          array.push(6)
        },
        async (req, res, next: NextPipe<[number]>) => {
          array.push(1)
          await next(3)
          array.push(5)
        }
      )
      .pipe(
        async (req, res, next, a, b) => {
          array.push(a)
          array.push(b)
          throw new Error("error")
        },
        async () => {
          array.push(7)
        }
      )
      .pipe(() => {
        array.push(8)
      })

    await f(undefined, undefined)
    expect(array).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})
