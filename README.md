# next-pipe

[![Unit Test](https://github.com/Toshimichi0915/next-pipe/actions/workflows/node.js.yml/badge.svg)](https://github.com/Toshimichi0915/next-pipe/actions/workflows/node.js.yml)
[![npm version](https://badge.fury.io/js/next-pipe.svg)](https://badge.fury.io/js/next-pipe)

Provides a simple way to pipe data through a series of functions.

## Installation

```bash
npm install next-pipe
```

## Usage

- [Creating custom middlwares](#custom-middleware)
- Adapters
- - [Method Routing](#method-routing)
- - [Next-Auth](#next-auth)
- - [Iron-Session](#iron-session)

## Custom Middleware

You can create a custom middleware in the following way.

```typescript
import { IncomingMessage, ServerResponse } from "http"

export function withEmptyMiddleware(): Midddleware<IncomingMessage, ServerResponse, [], []> {
  // the signature of generics is as it follows:
  // Middlware<
  //   the type of request(e.g. IncomingMessage),
  //   the type of response(e.g. ServerResponse),
  //   arguments this middlware receives,
  //   output values this middleware provides
  // >

  return (req, res, next) => {
    const result: NextPipeResult = await next()
    // result contains the following properties
    // - successful: true if the next middleware was called
    // - errored: true if the next middleware was called, but threw an error
    // - called: true if the next middleware does not exist or did not called
    // - value: the return value of the next middleware, which exists only if successful was true
    // - error: the error of the next middleware, which exists only if errored is true

    // this return value does nothing, because the return value matters only when next() wasn't called
    return "Hello, world!"
  }
}
```

## Method Routing

You can change the behavior of middlewares dpeending on the method of a request, with `withMethods`.

```typescript
function withMethods<TReq extends IncomingMessage, TRes extends ServerResponse, TArgs extends unknown[]>(
  f: (handler: MethodHandler<TReq, TRes, TArgs, TArgs>) => unknown
)
```

In the following example, the method will return `Hello world!` if the method is `GET`, and `Hello, ${name}` if the method is `POST`.

```typescript

const schema = z.object({
  name: z.string()
})

export const api = middleware<IncomingMessage, ServerResponse>()
  .pipe(withMethods(({ get, put }) => {
      get().pipe((req, res) => {
        res.send("Hello, world!")
      }
      post()
        .pipe(withValidatedBody(schema)
        .pipe((req, res, body) => {
          res.send(`Hello, ${body.name}`)
        })
    })
```

## Next-Auth

This adapter checks if the user is authenticated and returns a 401 error if not.

```typescript
function withServerSession(
  authOptions: AuthOptions, // next-auth options
  sessionRequired: boolean // if true, return 401 error if not authenticated
)
```

## Iron-Session

This adapter gets a session, and if the session does not exist, creates a new one.

```typescript
function withIronSession(
  options: IronSessionOptions
)
```

### Example

```typescript
import { NextApiRequest, NextApiResponse } from "next"
import { authOptions } from "./options"
import { middleware, withServerSession } from "next-pipe"

const requiresSession = true

export default middleware<NextApiRequest, NextApiResponse>()
  .pipe(withServerSession(authOptions, requiresSession))
  .pipe((req, res, next, session) => {
    if (session) {
      res.status(200).json({ message: `Hello ${session.user.name}` })
    } else {
      // this could occur if requiresSession is set to false
      res.status(200).json({ message: "You are not logged in" })
    }
  })
```
