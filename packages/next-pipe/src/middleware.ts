export interface MiddlewareOptions<TReq, TRes> {
  onError(req: TReq, res: TRes, e: unknown): unknown
}

export const defaultMiddlewareOptions: MiddlewareOptions<never, never> = {
  async onError(req, res, e: unknown) {
    // delegate errors to the caller
    throw e
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

export interface NextPipeInterrupted {
  called: false
  successful: false
  errored: false
}

export type NextPipeResult = NextPipeSuccessful | NextPipeErrored | NextPipeInterrupted

export interface NextPipe<TArgs extends unknown[]> {
  (...args: TArgs): Promise<NextPipeResult>
}

export interface Middleware<TReq, TRes, TArgs extends unknown[] = [], TRets extends unknown[] = []> {
  (req: TReq, res: TRes, next: NextPipe<TRets>, ...args: TArgs): unknown
}

export interface MiddlewareChain<TReq, TRes, TArgs extends unknown[], TRootArgs extends unknown[]> {
  (req: TReq, res: TRes, ...values: TRootArgs): Promise<unknown>
  pipe<TArray extends Middleware<TReq, TRes, TArgs, unknown[]>[]>(
    ...middlewares: TArray
  ): MiddlewareChain<TReq, TRes, ComposedRets<TArray>, TRootArgs>
  opts(options: Partial<MiddlewareOptions<TReq, TRes>>): this
}

type ComposedRets<
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
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}

class InternalMiddlewareChain<
  TReq,
  TRes,
  TArgs extends unknown[],
  TRets extends unknown[],
  TRootArgs extends unknown[]
> {
  private readonly middleware: Middleware<TReq, TRes, TArgs, TRets>
  readonly entrypoint: (req: TReq, res: TRes, ...values: TRootArgs) => Promise<unknown>
  options: MiddlewareOptions<TReq, TRes>

  private child: InternalMiddlewareChain<TReq, TRes, TRets, unknown[], TRootArgs> | undefined

  private constructor(
    middleware: Middleware<TReq, TRes, TArgs, TRets>,
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
    ): Promise<unknown> => {
      const result: unknown[] = []
      const queue: Deferred<NextPipeResult>[] = []

      const resolveQueue = async (value: NextPipeResult): Promise<void> => {
        for (const def of queue.reverse()) {
          def.resolve(value)
          await def.promise
        }
      }

      for (const middleware of middlewares) {
        const subArgs = args.splice(0, middleware.length)
        let nextCalled = false

        const deferred = new Deferred<NextPipeResult>()

        const promise = middleware(
          req,
          res,
          async (...values) => {
            nextCalled = true
            result.push(...values)

            queue.push(deferred)
            return await deferred.promise
          },
          ...(subArgs as TRets)
        )

        if (!nextCalled) {
          const ret = await promise
          await resolveQueue({
            called: false,
            successful: false,
            errored: false,
          })
          return ret
        }
      }

      const ret = await next(...(result as ComposedRets<TArray>))
      resolveQueue(ret)
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

    try {
      const value = await this.middleware(req, res, next, ...values)
      return {
        called: true,
        successful: true,
        errored: false,
        value,
      }
    } catch (e) {
      await this.options.onError(req, res, e)
      return {
        called: true,
        successful: false,
        errored: true,
        error: e,
      }
    }
  }

  static create<TReq, TRes, TArgs extends unknown[]>(
    options: MiddlewareOptions<TReq, TRes>
  ): InternalMiddlewareChain<TReq, TRes, TArgs, TArgs, TArgs> {
    const middleware = async (
      req: TReq,
      res: TRes,
      next: (...values: TArgs) => unknown,
      ...args: TArgs
    ): Promise<void> => {
      await next(...args)
    }

    const box: InternalMiddlewareChain<TReq, TRes, TArgs, TArgs, TArgs>[] = []

    const entrypoint = async (req: TReq, res: TRes, ...values: TArgs): Promise<void> => {
      await box[0].execute(req, res, ...values)
    }

    const result = new InternalMiddlewareChain<TReq, TRes, TArgs, TArgs, TArgs>(middleware, entrypoint, options)
    box.push(result)

    return result
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

export function middleware<TReq, TRes, TArgs extends unknown[]>(options?: Partial<MiddlewareOptions<TReq, TRes>>) {
  const chain = InternalMiddlewareChain.create<TReq, TRes, TArgs>({
    ...defaultMiddlewareOptions,
    ...options,
  })

  return convertInternal(chain)
}
