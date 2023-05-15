export interface MiddlewareOptions<TReq, TRes> {
  onError(req: TReq, res: TRes, e: unknown): unknown
}

export const defaultMiddlewareOptions: MiddlewareOptions<never, never> = {
  async onError(req, res, e: unknown) {
    // delegate errors to the caller
    throw e
  },
} as const

export interface NextPipe<TArgs extends unknown[]> {
  (...args: TArgs): Promise<void>
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
  readonly promise: Promise<unknown>
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

  private readonly children: InternalMiddlewareChain<TReq, TRes, TRets, unknown[], TRootArgs>[] = []

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
    async function middleware(
      req: TReq,
      res: TRes,
      next: (...values: ComposedRets<TArray>) => unknown,
      ...args: TRets
    ): Promise<unknown> {
      const result: unknown[] = []
      const queue: Deferred<void>[] = []

      const resolveQueue = async (): Promise<void> => {
        for (const def of queue.reverse()) {
          def.resolve()
          await def.promise
        }
      }

      for (const middleware of middlewares) {
        const subArgs = args.splice(0, middleware.length)
        let nextCalled = false

        const deferred = new Deferred()

        const promise = middleware(
          req,
          res,
          async (...values) => {
            nextCalled = true
            result.push(...values)

            queue.push(deferred)

            await deferred.promise
          },
          ...(subArgs as TRets)
        )

        if (!nextCalled) {
          const ret = await promise
          await resolveQueue()
          return ret
        }
      }

      const ret = await next(...(result as ComposedRets<TArray>))
      await resolveQueue()
      return ret
    }

    const chain = new InternalMiddlewareChain(middleware, this.entrypoint, this.options)
    this.children.push(chain)

    return chain
  }

  opts(options: Partial<MiddlewareOptions<TReq, TRes>>): this {
    this.options = {
      ...this.options,
      ...options,
    }

    return this
  }

  private async execute(req: TReq, res: TRes, ...values: TArgs): Promise<void> {
    const next = async (...values: TRets) => {
      for (const child of this.children) {
        await child.execute(req, res, ...values)
      }
    }

    try {
      await this.middleware(req, res, next, ...values)
    } catch (e) {
      await this.options.onError(req, res, e)
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
