export interface MiddlewareOptions<TReq, TRes> {
  onError(req: TReq, res: TRes, e: unknown): unknown
}

export const defaultMiddlewareOptions: MiddlewareOptions<never, never> = {
  async onError() {
    // do nothing
  },
} as const

export interface NextPipeSuccessful {
  called: true
  successful: true
  errored: false
  value: unknown
}

export interface NextPipeErrored {
  called: true
  successful: false
  errored: true
  error: unknown
}

export interface NextPipeStopped {
  called: false
  successful: false
  errored: false
}

export type NextPipeResult = NextPipeSuccessful | NextPipeErrored | NextPipeStopped

export interface NextPipe<TArgs extends unknown[]> {
  (...args: TArgs): Promise<NextPipeResult>
}

export interface Middleware<TReq, TRes, TArgs extends unknown[] = [], TRets extends unknown[] = []> {
  (req: TReq, res: TRes, next: NextPipe<TRets>, ...args: TArgs): unknown
}

export interface MiddlewareChain<TReq, TRes, TRets extends unknown[], TRootArgs extends unknown[]> {
  (req: TReq, res: TRes, ...values: TRootArgs): Promise<unknown>

  // POV: You're a TypeScript developer and you're trying to figure out what the hell this is
  // https://github.com/ReactiveX/rxjs/blob/master/src/internal/util/pipe.ts#L4-L70
  // https://github.com/gcanti/fp-ts/blob/master/src/function.ts#L397-L689
  // https://github.com/ReactiveX/rxjs/pull/7224
  pipe<T1 extends unknown[]>(
    middleware1: Middleware<TReq, TRes, TRets, T1>
  ): MiddlewareChain<TReq, TRes, [...T1], TRootArgs>

  pipe<T1 extends unknown[], T2 extends unknown[]>(
    middleware1: Middleware<TReq, TRes, TRets, T1>,
    middleware2: Middleware<TReq, TRes, TRets, T2>
  ): MiddlewareChain<TReq, TRes, [...T1, ...T2], TRootArgs>

  pipe<T1 extends unknown[], T2 extends unknown[], T3 extends unknown[]>(
    middleware1: Middleware<TReq, TRes, TRets, T1>,
    middleware2: Middleware<TReq, TRes, TRets, T2>,
    middleware3: Middleware<TReq, TRes, TRets, T3>
  ): MiddlewareChain<TReq, TRes, [...T1, ...T2, ...T3], TRootArgs>

  pipe<T1 extends unknown[], T2 extends unknown[], T3 extends unknown[], T4 extends unknown[]>(
    middleware1: Middleware<TReq, TRes, TRets, T1>,
    middleware2: Middleware<TReq, TRes, TRets, T2>,
    middleware3: Middleware<TReq, TRes, TRets, T3>,
    middleware4: Middleware<TReq, TRes, TRets, T4>
  ): MiddlewareChain<TReq, TRes, [...T1, ...T2, ...T3, ...T4], TRootArgs>

  pipe<T1 extends unknown[], T2 extends unknown[], T3 extends unknown[], T4 extends unknown[], T5 extends unknown[]>(
    middleware1: Middleware<TReq, TRes, TRets, T1>,
    middleware2: Middleware<TReq, TRes, TRets, T2>,
    middleware3: Middleware<TReq, TRes, TRets, T3>,
    middleware4: Middleware<TReq, TRes, TRets, T4>,
    middleware5: Middleware<TReq, TRes, TRets, T5>
  ): MiddlewareChain<TReq, TRes, [...T1, ...T2, ...T3, ...T4, ...T5], TRootArgs>

  pipe<
    T1 extends unknown[],
    T2 extends unknown[],
    T3 extends unknown[],
    T4 extends unknown[],
    T5 extends unknown[],
    T6 extends unknown[]
  >(
    middleware1: Middleware<TReq, TRes, TRets, T1>,
    middleware2: Middleware<TReq, TRes, TRets, T2>,
    middleware3: Middleware<TReq, TRes, TRets, T3>,
    middleware4: Middleware<TReq, TRes, TRets, T4>,
    middleware5: Middleware<TReq, TRes, TRets, T5>,
    middleware6: Middleware<TReq, TRes, TRets, T6>
  ): MiddlewareChain<TReq, TRes, [...T1, ...T2, ...T3, ...T4, ...T5, ...T6], TRootArgs>

  pipe<
    T1 extends unknown[],
    T2 extends unknown[],
    T3 extends unknown[],
    T4 extends unknown[],
    T5 extends unknown[],
    T6 extends unknown[],
    T7 extends unknown[]
  >(
    middleware1: Middleware<TReq, TRes, TRets, T1>,
    middleware2: Middleware<TReq, TRes, TRets, T2>,
    middleware3: Middleware<TReq, TRes, TRets, T3>,
    middleware4: Middleware<TReq, TRes, TRets, T4>,
    middleware5: Middleware<TReq, TRes, TRets, T5>,
    middleware6: Middleware<TReq, TRes, TRets, T6>,
    middleware7: Middleware<TReq, TRes, TRets, T6>
  ): MiddlewareChain<TReq, TRes, [...T1, ...T2, ...T3, ...T4, ...T5, ...T6, ...T7], TRootArgs>

  pipe<
    T1 extends unknown[],
    T2 extends unknown[],
    T3 extends unknown[],
    T4 extends unknown[],
    T5 extends unknown[],
    T6 extends unknown[],
    T7 extends unknown[],
    T8 extends unknown[]
  >(
    middleware1: Middleware<TReq, TRes, TRets, T1>,
    middleware2: Middleware<TReq, TRes, TRets, T2>,
    middleware3: Middleware<TReq, TRes, TRets, T3>,
    middleware4: Middleware<TReq, TRes, TRets, T4>,
    middleware5: Middleware<TReq, TRes, TRets, T5>,
    middleware6: Middleware<TReq, TRes, TRets, T6>,
    middleware7: Middleware<TReq, TRes, TRets, T7>,
    middleware8: Middleware<TReq, TRes, TRets, T8>
  ): MiddlewareChain<TReq, TRes, [...T1, ...T2, ...T3, ...T4, ...T5, ...T6, ...T7, ...T8], TRootArgs>

  pipe<
    T1 extends unknown[],
    T2 extends unknown[],
    T3 extends unknown[],
    T4 extends unknown[],
    T5 extends unknown[],
    T6 extends unknown[],
    T7 extends unknown[],
    T8 extends unknown[],
    T9 extends unknown[]
  >(
    middleware1: Middleware<TReq, TRes, TRets, T1>,
    middleware2: Middleware<TReq, TRes, TRets, T2>,
    middleware3: Middleware<TReq, TRes, TRets, T3>,
    middleware4: Middleware<TReq, TRes, TRets, T4>,
    middleware5: Middleware<TReq, TRes, TRets, T5>,
    middleware6: Middleware<TReq, TRes, TRets, T6>,
    middleware7: Middleware<TReq, TRes, TRets, T7>,
    middleware8: Middleware<TReq, TRes, TRets, T8>,
    middleware9: Middleware<TReq, TRes, TRets, T9>
  ): MiddlewareChain<TReq, TRes, [...T1, ...T2, ...T3, ...T4, ...T5, ...T6, ...T7, ...T8, ...T9], TRootArgs>

  pipe<
    T1 extends unknown[],
    T2 extends unknown[],
    T3 extends unknown[],
    T4 extends unknown[],
    T5 extends unknown[],
    T6 extends unknown[],
    T7 extends unknown[],
    T8 extends unknown[],
    T9 extends unknown[],
    T10 extends unknown[]
  >(
    middleware1: Middleware<TReq, TRes, TRets, T1>,
    middleware2: Middleware<TReq, TRes, TRets, T2>,
    middleware3: Middleware<TReq, TRes, TRets, T3>,
    middleware4: Middleware<TReq, TRes, TRets, T4>,
    middleware5: Middleware<TReq, TRes, TRets, T5>,
    middleware6: Middleware<TReq, TRes, TRets, T6>,
    middleware7: Middleware<TReq, TRes, TRets, T7>,
    middleware8: Middleware<TReq, TRes, TRets, T8>,
    middleware9: Middleware<TReq, TRes, TRets, T9>,
    middleware10: Middleware<TReq, TRes, TRets, T10>
  ): MiddlewareChain<TReq, TRes, [...T1, ...T2, ...T3, ...T4, ...T5, ...T6, ...T7, ...T8, ...T9, ...T10], TRootArgs>

  pipe<TArray extends Middleware<TReq, TRes, TRets, unknown[]>[]>(
    ...middlewares: TArray
  ): MiddlewareChain<TReq, TRes, ComposedRets<TArray>, TRootArgs>

  opts(options: Partial<MiddlewareOptions<TReq, TRes>>): this
}

export type ComposedRets<
  TArray extends Middleware<never, never, never, unknown[]>[],
  TRets extends unknown[] = []
> = TArray extends [infer TFirst, ...infer TRest]
  ? TFirst extends Middleware<never, never, never, infer TFirstRets>
    ? TRest extends Middleware<never, never, never, unknown[]>[]
      ? ComposedRets<TRest, [...TRets, ...TFirstRets]>
      : never
    : never
  : TRets

class Deferred<T> {
  readonly promise: Promise<T>
  resolve!: (value: T | PromiseLike<T>) => void
  reject!: (reason?: unknown) => void
  resolved = false
  rejected = false

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = async (value: T | PromiseLike<T>) => {
        this.resolved = true
        return resolve(value)
      }
      this.reject = async (reason?: unknown) => {
        this.rejected = true
        return reject(reason)
      }
    })
  }
}

export interface InternalMiddleware<TReq, TRes, TArgs extends unknown[] = [], TRets extends unknown[] = []> {
  (req: TReq, res: TRes, next: NextPipe<TRets>, ...args: TArgs): Promise<NextPipeResult>
}

class InternalMiddlewareChain<
  TReq,
  TRes,
  TArgs extends unknown[],
  TRets extends unknown[],
  TRootArgs extends unknown[]
> {
  private readonly middleware: InternalMiddleware<TReq, TRes, TArgs, TRets>
  readonly entrypoint: (req: TReq, res: TRes, ...values: TRootArgs) => Promise<unknown>
  options: MiddlewareOptions<TReq, TRes>

  private child: InternalMiddlewareChain<TReq, TRes, TRets, unknown[], TRootArgs> | undefined

  private constructor(
    middleware: InternalMiddleware<TReq, TRes, TArgs, TRets>,
    entrypoint: (req: TReq, res: TRes, ...values: TRootArgs) => Promise<unknown>,
    options: MiddlewareOptions<TReq, TRes>
  ) {
    this.middleware = middleware
    this.entrypoint = entrypoint
    this.options = options
  }

  pipe<TArray extends Middleware<TReq, TRes, TRets, unknown[]>[]>(
    ...middlewares: TArray
  ): InternalMiddlewareChain<TReq, TRes, TRets, ComposedRets<TArray>, TRootArgs> {
    const composedMiddleware = async (
      req: TReq,
      res: TRes,
      next: (...values: ComposedRets<TArray>) => Promise<NextPipeResult>,
      ...args: TRets
    ): Promise<NextPipeResult> => {
      const result: unknown[] = []
      const queue: Deferred<NextPipeResult>[] = []
      const promises: Promise<unknown>[] = []

      const resolveQueue = async (value: NextPipeResult): Promise<void> => {
        for (const def of queue.reverse()) {
          def.resolve(value)
          await def.promise
        }

        await Promise.all(promises)
      }

      const handleError = async (e: unknown): Promise<NextPipeResult> => {
        try {
          await this.options.onError(req, res, e)
          await resolveQueue({
            called: false,
            successful: false,
            errored: false,
          })
        } catch (e) {
          // Could not handle error
          return {
            called: true,
            successful: false,
            errored: true,
            error: e,
          }
        }

        return {
          called: true,
          successful: false,
          errored: true,
          error: e,
        }
      }

      for (const middleware of middlewares) {
        const subArgs = args.splice(0, middleware.length)

        const deferred = new Deferred<NextPipeResult>()
        const next = new Deferred<boolean>()

        const asyncMiddleware = async () => {
          return await middleware(
            req,
            res,
            async (...values) => {
              next.resolve(true)
              result.push(...values)
              queue.push(deferred)
              return await deferred.promise
            },
            ...(subArgs as TRets)
          )
        }

        const promise = asyncMiddleware()

        try {
          await Promise.race([promise, next])
        } catch (e) {
          return await handleError(e)
        }

        // next() was called
        if (next.resolved) {
          promises.push(promise)
          continue
        }

        let ret
        try {
          ret = await promise
        } catch (e) {
          return await handleError(e)
        }

        await resolveQueue({
          called: false,
          successful: false,
          errored: false,
        })

        return {
          called: true,
          successful: true,
          errored: false,
          value: ret,
        }
      }

      const ret = await next(...(result as ComposedRets<TArray>))
      await resolveQueue(ret)
      return ret
    }

    const chain = new InternalMiddlewareChain(composedMiddleware, this.entrypoint, this.options)
    this.child = chain

    return chain
  }

  opts(options: Partial<MiddlewareOptions<TReq, TRes>>): this {
    this.options = {
      ...this.options,
      ...options,
    }

    return this
  }

  private async execute(req: TReq, res: TRes, ...values: TArgs): Promise<NextPipeResult> {
    const next = async (...values: TRets): Promise<NextPipeResult> => {
      if (!this.child) {
        return {
          called: false,
          successful: false,
          errored: false,
        }
      }
      return await this.child.execute(req, res, ...values)
    }

    return await this.middleware(req, res, next, ...values)
  }

  static create<TReq, TRes, TArgs extends unknown[]>(
    options: MiddlewareOptions<TReq, TRes>
  ): InternalMiddlewareChain<TReq, TRes, TArgs, TArgs, TArgs> {
    const middleware = async (
      req: TReq,
      res: TRes,
      next: (...values: TArgs) => Promise<NextPipeResult>,
      ...args: TArgs
    ): Promise<NextPipeResult> => {
      return await next(...args)
    }

    // lazy init
    // eslint-disable-next-line prefer-const
    let m: InternalMiddlewareChain<TReq, TRes, TArgs, TArgs, TArgs>

    const entrypoint = async (req: TReq, res: TRes, ...values: TArgs): Promise<unknown> => {
      const result = await m.execute(req, res, ...values)
      if (result.successful) {
        return result.value
      } else if (result.errored) {
        throw result.error
      } else if (!result.called) {
        return undefined
      }

      throw new Error(`This should never happen: ${JSON.stringify(result)}`)
    }

    m = new InternalMiddlewareChain<TReq, TRes, TArgs, TArgs, TArgs>(middleware, entrypoint, options)
    return m
  }
}

function convertInternal<TReq, TRes, TArgs extends unknown[], TRets extends unknown[], TRootArgs extends unknown[]>(
  chain: InternalMiddlewareChain<TReq, TRes, TArgs, TRets, TRootArgs>
): MiddlewareChain<TReq, TRes, TRets, TRootArgs> {
  const pipe = <TArray extends Middleware<TReq, TRes, TRets, unknown[]>[]>(
    ...middlewares: TArray
  ): MiddlewareChain<TReq, TRes, ComposedRets<TArray>, TRootArgs> => {
    const internal = chain.pipe(...middlewares)
    return convertInternal(internal)
  }

  const entrypoint = (req: TReq, res: TRes, ...values: TRootArgs): Promise<unknown> => {
    return chain.entrypoint(req, res, ...values)
  }

  const opts = (options: Partial<MiddlewareOptions<TReq, TRes>>): MiddlewareChain<TReq, TRes, TRets, TRootArgs> => {
    return convertInternal(chain.opts(options))
  }

  return Object.assign(entrypoint, { pipe, opts })
}

export function middleware<TReq, TRes, TArgs extends unknown[] = []>(options?: Partial<MiddlewareOptions<TReq, TRes>>) {
  const chain = InternalMiddlewareChain.create<TReq, TRes, TArgs>({
    ...defaultMiddlewareOptions,
    ...options,
  })

  return convertInternal(chain)
}

export function createFakeMiddlewareChain<
  TReq,
  TRes,
  TArgs extends unknown[],
  TRets extends unknown[],
  TRootArgs extends unknown[]
>(): MiddlewareChain<TReq, TRes, TArgs, TRootArgs> {
  // lazy init
  // eslint-disable-next-line prefer-const
  let middleware: MiddlewareChain<TReq, TRes, TArgs, TRootArgs>

  const run = async () => {
    // do nothing
  }

  const pipe = <TArray extends Middleware<TReq, TRes, TRets, unknown[]>[]>(): MiddlewareChain<
    TReq,
    TRes,
    ComposedRets<TArray>,
    TRootArgs
  > => {
    // this middleware will never run, so we can just return it
    return middleware as unknown as MiddlewareChain<TReq, TRes, ComposedRets<TArray>, TRootArgs>
  }

  const opts = (): MiddlewareChain<TReq, TRes, TArgs, TRootArgs> => {
    return middleware
  }

  middleware = Object.assign(run, { pipe, opts })
  return middleware
}
