import { NextPipe, middleware } from "../src"
import { describe, it } from "vitest"

describe("control-flow", () => {
  it("simple", async ({ expect }) => {
    const array: number[] = []
    const f = middleware<undefined, undefined>()
      .pipe(
        async (req, res, next: NextPipe<[number]>) => {
          array.push(0)
          if ((await next(2)).successful) {
            array.push(5)
          }
        },
        async (req, res, next: NextPipe<[number]>) => {
          array.push(1)
          if ((await next(3)).successful) {
            array.push(4)
          }
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
    const f = middleware<undefined, undefined>({
      onError: async () => {
        array.push(4)
      },
    })
      .pipe(
        async (req, res, next: NextPipe<[number]>) => {
          array.push(0)
          if ((await next(2)).errored) {
            array.push(8)
          }
        },
        async (req, res, next: NextPipe<[number]>) => {
          array.push(1)
          if ((await next(3)).errored) {
            array.push(7)
          }
        }
      )
      .pipe(
        async (req, res, next, a, b) => {
          array.push(a)
          array.push(b)
          if (!(await next()).called) {
            array.push(6)
          }
        },
        async (req, res, next) => {
          if (!(await next()).called) {
            array.push(5)
          }
        },
        async () => {
          throw new Error("error")
        }
      )
      .pipe(() => {
        array.push(8)
      })

    await expect(f(undefined, undefined)).rejects.toThrow("error")
    expect(array).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })
})
