/**
 * Represents a middleware option.
 */
export interface MiddlewareOptions<TReq, TRes> {
  /**
   * Called when a middleware throws an error.
   * @param req The request object.
   * @param res The response object.
   * @param e The error thrown.
   * @returns The value to return from the middleware.
   */
  onError(req: TReq, res: TRes, e: unknown): unknown
}

/**
 * The default middleware options.
 */
const defaultMiddlewareOptions: MiddlewareOptions<never, never> = {
  async onError() {
    // do nothing
  },
} as const

/**
 * Represents a successful next() call.
 */
export interface NextPipeSuccessful {
  called: true
  successful: true
  errored: false
  value: unknown
}

/**
 * Represents a next() call that threw an error.
 */
export interface NextPipeErrored {
  called: true
  successful: false
  errored: true
  error: unknown
}

/**
 * Represents a next() call that was not called.
 */
export interface NextPipeStopped {
  called: false
  successful: false
  errored: false
}

/**
 * Represents the result of a next() call.
 */
export type NextPipeResult = NextPipeSuccessful | NextPipeErrored | NextPipeStopped

/**
 * Represents a next() function.
 * @param args The arguments to pass to the next middleware.
 * @returns The result of the next() call.
 */
export interface NextPipe<TArgs extends unknown[]> {
  (...args: TArgs): Promise<NextPipeResult>
}

/**
 * Represents a middleware.
 * @param req The request object.
 * @param res The response object.
 * @param next The next() function.
 * @param args The arguments passed to the middleware.
 * @returns The value to return from the middleware.
 */
export interface Middleware<TReq, TRes, TArgs extends unknown[] = [], TRets extends unknown[] = []> {
  (req: TReq, res: TRes, next: NextPipe<TRets>, ...args: TArgs): unknown
}

/**
 * Represents a middleware provider.
 */
export type MiddlewareProvider<TReq, TRes, TArgs extends unknown[], TRets extends unknown[]> =
  | Middleware<TReq, TRes, TArgs, TRets>
  | Promise<Middleware<TReq, TRes, TArgs, TRets>>

/**
 * Represents a middleware chain.
 * @param req The request object.
 * @param res The response object.
 * @param values The values passed to the middleware.
 * @returns The value to return from the middleware.
 */
export interface MiddlewareChain<TReq, TRes, TRets extends unknown[], TRootArgs extends unknown[]> {
  (req: TReq, res: TRes, ...values: TRootArgs): Promise<unknown>

  // POV: You're a TypeScript developer and you're trying to figure out what the hell this is
  // https://github.com/ReactiveX/rxjs/blob/master/src/internal/util/pipe.ts#L4-L70
  // https://github.com/gcanti/fp-ts/blob/master/src/function.ts#L397-L689
  // https://github.com/ReactiveX/rxjs/pull/7224
  pipe<T1 extends unknown[]>(
    middleware1: MiddlewareProvider<TReq, TRes, TRets, T1>
  ): MiddlewareChain<TReq, TRes, [...TRets, ...T1], TRootArgs>

  pipe<T1 extends unknown[], T2 extends unknown[]>(
    middleware1: MiddlewareProvider<TReq, TRes, TRets, T1>,
    middleware2: MiddlewareProvider<TReq, TRes, TRets, T2>
  ): MiddlewareChain<TReq, TRes, [...TRets, ...T1, ...T2], TRootArgs>

  pipe<T1 extends unknown[], T2 extends unknown[], T3 extends unknown[]>(
    middleware1: MiddlewareProvider<TReq, TRes, TRets, T1>,
    middleware2: MiddlewareProvider<TReq, TRes, TRets, T2>,
    middleware3: MiddlewareProvider<TReq, TRes, TRets, T3>
  ): MiddlewareChain<TReq, TRes, [...TRets, ...T1, ...T2, ...T3], TRootArgs>

  pipe<T1 extends unknown[], T2 extends unknown[], T3 extends unknown[], T4 extends unknown[]>(
    middleware1: MiddlewareProvider<TReq, TRes, TRets, T1>,
    middleware2: MiddlewareProvider<TReq, TRes, TRets, T2>,
    middleware3: MiddlewareProvider<TReq, TRes, TRets, T3>,
    middleware4: MiddlewareProvider<TReq, TRes, TRets, T4>
  ): MiddlewareChain<TReq, TRes, [...TRets, ...T1, ...T2, ...T3, ...T4], TRootArgs>

  pipe<T1 extends unknown[], T2 extends unknown[], T3 extends unknown[], T4 extends unknown[], T5 extends unknown[]>(
    middleware1: MiddlewareProvider<TReq, TRes, TRets, T1>,
    middleware2: MiddlewareProvider<TReq, TRes, TRets, T2>,
    middleware3: MiddlewareProvider<TReq, TRes, TRets, T3>,
    middleware4: MiddlewareProvider<TReq, TRes, TRets, T4>,
    middleware5: MiddlewareProvider<TReq, TRes, TRets, T5>
  ): MiddlewareChain<TReq, TRes, [...TRets, ...T1, ...T2, ...T3, ...T4, ...T5], TRootArgs>

  pipe<
    T1 extends unknown[],
    T2 extends unknown[],
    T3 extends unknown[],
    T4 extends unknown[],
    T5 extends unknown[],
    T6 extends unknown[]
  >(
    middleware1: MiddlewareProvider<TReq, TRes, TRets, T1>,
    middleware2: MiddlewareProvider<TReq, TRes, TRets, T2>,
    middleware3: MiddlewareProvider<TReq, TRes, TRets, T3>,
    middleware4: MiddlewareProvider<TReq, TRes, TRets, T4>,
    middleware5: MiddlewareProvider<TReq, TRes, TRets, T5>,
    middleware6: MiddlewareProvider<TReq, TRes, TRets, T6>
  ): MiddlewareChain<TReq, TRes, [...TRets, ...T1, ...T2, ...T3, ...T4, ...T5, ...T6], TRootArgs>

  pipe<
    T1 extends unknown[],
    T2 extends unknown[],
    T3 extends unknown[],
    T4 extends unknown[],
    T5 extends unknown[],
    T6 extends unknown[],
    T7 extends unknown[]
  >(
    middleware1: MiddlewareProvider<TReq, TRes, TRets, T1>,
    middleware2: MiddlewareProvider<TReq, TRes, TRets, T2>,
    middleware3: MiddlewareProvider<TReq, TRes, TRets, T3>,
    middleware4: MiddlewareProvider<TReq, TRes, TRets, T4>,
    middleware5: MiddlewareProvider<TReq, TRes, TRets, T5>,
    middleware6: MiddlewareProvider<TReq, TRes, TRets, T6>,
    middleware7: MiddlewareProvider<TReq, TRes, TRets, T6>
  ): MiddlewareChain<TReq, TRes, [...TRets, ...T1, ...T2, ...T3, ...T4, ...T5, ...T6, ...T7], TRootArgs>

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
    middleware1: MiddlewareProvider<TReq, TRes, TRets, T1>,
    middleware2: MiddlewareProvider<TReq, TRes, TRets, T2>,
    middleware3: MiddlewareProvider<TReq, TRes, TRets, T3>,
    middleware4: MiddlewareProvider<TReq, TRes, TRets, T4>,
    middleware5: MiddlewareProvider<TReq, TRes, TRets, T5>,
    middleware6: MiddlewareProvider<TReq, TRes, TRets, T6>,
    middleware7: MiddlewareProvider<TReq, TRes, TRets, T7>,
    middleware8: MiddlewareProvider<TReq, TRes, TRets, T8>
  ): MiddlewareChain<TReq, TRes, [...TRets, ...T1, ...T2, ...T3, ...T4, ...T5, ...T6, ...T7, ...T8], TRootArgs>

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
    middleware1: MiddlewareProvider<TReq, TRes, TRets, T1>,
    middleware2: MiddlewareProvider<TReq, TRes, TRets, T2>,
    middleware3: MiddlewareProvider<TReq, TRes, TRets, T3>,
    middleware4: MiddlewareProvider<TReq, TRes, TRets, T4>,
    middleware5: MiddlewareProvider<TReq, TRes, TRets, T5>,
    middleware6: MiddlewareProvider<TReq, TRes, TRets, T6>,
    middleware7: MiddlewareProvider<TReq, TRes, TRets, T7>,
    middleware8: MiddlewareProvider<TReq, TRes, TRets, T8>,
    middleware9: MiddlewareProvider<TReq, TRes, TRets, T9>
  ): MiddlewareChain<TReq, TRes, [...TRets, ...T1, ...T2, ...T3, ...T4, ...T5, ...T6, ...T7, ...T8, ...T9], TRootArgs>

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
    middleware1: MiddlewareProvider<TReq, TRes, TRets, T1>,
    middleware2: MiddlewareProvider<TReq, TRes, TRets, T2>,
    middleware3: MiddlewareProvider<TReq, TRes, TRets, T3>,
    middleware4: MiddlewareProvider<TReq, TRes, TRets, T4>,
    middleware5: MiddlewareProvider<TReq, TRes, TRets, T5>,
    middleware6: MiddlewareProvider<TReq, TRes, TRets, T6>,
    middleware7: MiddlewareProvider<TReq, TRes, TRets, T7>,
    middleware8: MiddlewareProvider<TReq, TRes, TRets, T8>,
    middleware9: MiddlewareProvider<TReq, TRes, TRets, T9>,
    middleware10: MiddlewareProvider<TReq, TRes, TRets, T10>
  ): MiddlewareChain<
    TReq,
    TRes,
    [...TRets, ...T1, ...T2, ...T3, ...T4, ...T5, ...T6, ...T7, ...T8, ...T9, ...T10],
    TRootArgs
  >

  /**
   * Adds the given middlewares to the chain.
   * The middlewares will be executed in the order they are passed to this method.
   * @param middlewares the middlewares to add to the chain
   */
  pipe<TArray extends MiddlewareProvider<TReq, TRes, TRets, unknown[]>[]>(
    ...middlewares: TArray
  ): MiddlewareChain<TReq, TRes, ComposedRets<TArray, [...TRets]>, TRootArgs>

  /**
   * Sets the options for the middleware chain.
   * This method must be called before calling `pipe` for the options to be applied.
   * @param options new options to merge with existing ones
   */
  opts(options: Partial<MiddlewareOptions<TReq, TRes>>): this
}

/**
 * The type of the return values of multiple middlewares composed together.
 */
type ComposedRets<
  TArray extends MiddlewareProvider<never, never, never, unknown[]>[],
  TRets extends unknown[]
> = TArray extends [infer TFirst, ...infer TRest]
  ? TFirst extends MiddlewareProvider<never, never, never, infer TFirstRets>
    ? TRest extends MiddlewareProvider<never, never, never, unknown[]>[]
      ? ComposedRets<TRest, [...TRets, ...TFirstRets]>
      : never
    : never
  : [...TRets]

// https://stackoverflow.com/questions/26150232/resolve-javascript-promise-outside-the-promise-constructor-scope
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

/** This middleware is only used by {@link InternalMiddlewareChain} */
interface InternalMiddleware<TReq, TRes, TArgs extends unknown[] = [], TRets extends unknown[] = []> {
  (req: TReq, res: TRes, next: NextPipe<TRets>, ...args: TArgs): Promise<NextPipeResult>
}

/** A internal middleware chain */
class InternalMiddlewareChain<
  TReq,
  TRes,
  TArgs extends unknown[],
  TRets extends unknown[],
  TRootArgs extends unknown[]
> {
  /**
   * The middleware function to execute.
   * This middleware might be composed of multiple middlewares.
   */
  private readonly middleware: InternalMiddleware<TReq, TRes, TArgs, TRets>

  /**
   * The entrypoint of the middleware chain.
   * This function is first called when the middleware chain is executed.
   */
  readonly entrypoint: (req: TReq, res: TRes, ...values: TRootArgs) => Promise<unknown>

  /**
   * The options of the middleware chain.
   */
  options: MiddlewareOptions<TReq, TRes>

  /**
   * The child middleware chain.
   */
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

  pipe<TArray extends MiddlewareProvider<TReq, TRes, TRets, unknown[]>[]>(
    ...middlewares: TArray
  ): InternalMiddlewareChain<TReq, TRes, TRets, ComposedRets<TArray, [...TRets]>, TRootArgs> {
    // compose multiple middlewares into one
    const composedMiddleware = async (
      req: TReq,
      res: TRes,
      next: (...values: ComposedRets<TArray, [...TRets]>) => Promise<NextPipeResult>,
      ...args: TRets
    ): Promise<NextPipeResult> => {
      /** the result values of the middlewares */
      const result: unknown[] = []
      /** all the middlewares that called `next` */
      const promises: Promise<unknown>[] = []
      /** promises of `next` funciton itself */
      const queue: Deferred<NextPipeResult>[] = []

      /** Tell all the middlwares that the processing of the next middleware completed */
      const resolveQueue = async (value: NextPipeResult): Promise<void> => {
        for (const def of queue.reverse()) {
          def.resolve(value)
          await def.promise
        }

        await Promise.all(promises)
      }

      /** Catch errors thrown by middlewares */
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

      for (const provider of middlewares) {
        const middleware = await provider
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
            ...(args as TRets)
          )
        }

        const promise = asyncMiddleware()

        try {
          await Promise.race([promise, next.promise])
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

      const ret = await (next as NextPipe<unknown[]>)(...args, ...result)
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

  /**
   * Execute the middleware chain.
   * @param req the request object
   * @param res the response object
   * @param values the arguments
   * @returns the result of the middleware chain
   */
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

  /**
   * Create a new middleware chain.
   * @param options the options of the middleware chain
   * @returns the middleware chain
   */
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

/**
 * Convert {@link InternalMiddlewareChain} to {@link MiddlewareChain}
 * @param chain the internal middleware chain
 * @returns the middleware chain
 */
function convertInternal<TReq, TRes, TArgs extends unknown[], TRets extends unknown[], TRootArgs extends unknown[]>(
  chain: InternalMiddlewareChain<TReq, TRes, TArgs, TRets, TRootArgs>
): MiddlewareChain<TReq, TRes, TRets, TRootArgs> {
  const pipe = <TArray extends Middleware<TReq, TRes, TRets, unknown[]>[]>(
    ...middlewares: TArray
  ): MiddlewareChain<TReq, TRes, ComposedRets<TArray, [...TRets]>, TRootArgs> => {
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

/**
 * Create a new middleware chain.
 * @param options the options of the middleware chain
 * @returns the middleware chain
 */
export function middleware<TReq, TRes, TArgs extends unknown[] = []>(options?: Partial<MiddlewareOptions<TReq, TRes>>) {
  const chain = InternalMiddlewareChain.create<TReq, TRes, TArgs>({
    ...defaultMiddlewareOptions,
    ...options,
  })

  return convertInternal(chain)
}
