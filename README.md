# next-pipe

[![Unit Test](https://github.com/Toshimichi0915/next-pipe/actions/workflows/test.yml/badge.svg)](https://github.com/Toshimichi0915/next-pipe/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/next-pipe.svg)](https://badge.fury.io/js/next-pipe)
[![codecov](https://codecov.io/gh/Toshimichi0915/next-pipe/branch/main/graph/badge.svg?token=5GCGOI3A0E)](https://codecov.io/gh/Toshimichi0915/next-pipe)

Provides a simple way to pipe data through a series of functions.

## Installation

```bash
npm install next-pipe
```

## Features

- 🌈 Support for both CommonJS and ES Modules

- 🚀 Built with Typescript

- 📦 Built-in Next-Auth and Iron-Session adapters, as well as utility adapters

## Usage

- [Basic Usage](#basic-usage)
- [Creating custom middlwares](#custom-middleware)
- Adapters
- - [Method Routing](#method-routing)
- - [Next-Auth](#next-auth)
- - [Iron-Session](#iron-session)

## Basic Usage

This library allows you to merge multiple middlewares into one, and then pass the request and response to the middleware directly.

In the following example, there are total of 3 middlewares, and the last one returns the response. The first two middlewares are called in order, and the last one is called with the return values of the first two middlewares. This means you can combine multiple utility middlewares into one, and then use them in the main handler.

```typescript
import { NextApiRequest, NextApiResponse } from "next"
import { NextPipe, middleware } from "next-pipe"

export default middleware<NextApiRequest, NextApiResponse>()
  .pipe(
    async (req, res, next: NextPipe<[string]>) => {
      await next("Hello")
    },
    async (req, res, next: NextPipe<[string]>) => {
      await next("world")
    }
  )
  .pipe(async (req, res, next, message1, message) => {
    res.status(200).json({ message: message1 + ", " + message })
  })
```

## Custom Middleware

You can create a custom middleware in the following way.

```typescript
import { IncomingMessage, ServerResponse } from "http"
import { NextPipeResult, Middleware } from "next-pipe"

export function withEmptyMiddleware(): Middleware<IncomingMessage, ServerResponse, [], []> {
  // the signature of generics is as it follows:
  // Middlware<
  //   the type of request(e.g. IncomingMessage),
  //   the type of response(e.g. ServerResponse),
  //   arguments this middlware receives,
  //   output values this middleware provides
  // >

  return async (req, res, next) => {
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
import express from "express"
import { z } from "zod"
import { middleware, withMethods, withValidatedBody } from "next-pipe"

const schema = z.object({
  name: z.string(),
})

export default middleware<express.Request, express.Response>().pipe(
  withMethods(({ get, post }) => {
    get().pipe((req, res) => {
      res.send("Hello, world!")
    })

    post()
      .pipe(withValidatedBody(schema))
      .pipe((req, res, body) => {
        res.send(`Hello, ${body.name}`)
      })
  })
)
```

## Next-Auth

This adapter checks if the user is authenticated and returns a 401 error if not.

```typescript
function withServerSession(
  authOptions: AuthOptions, // next-auth options
  sessionRequired: boolean // if true, return 401 error if not authenticated
)
```

```typescript
import { NextApiRequest, NextApiResponse } from "next"
import { authOptions } from "./options"
import { middleware, withServerSession } from "next-pipe"

const requiresSession = true

export default middleware<NextApiRequest, NextApiResponse>()
  .pipe(withServerSession(authOptions, requiresSession))
  .pipe((req, res, next, session) => {
    if (session) {
      res.status(200).json({ message: `Hello ${session.user?.name}` })
    } else {
      // this could occur if requiresSession is set to false
      res.status(200).json({ message: "You are not logged in" })
    }
  })
```

## Iron-Session

This adapter gets a session, and if the session does not exist, creates a new one.

```typescript
function withIronSession(options: IronSessionOptions)
```

```typescript
import { NextApiRequest, NextApiResponse } from "next"
import { middleware, withIronSession } from "next-pipe"

const cookieName = process.env.IRON_COOKIE_NAME
const password = process.env.IRON_PASSWORD
if (!cookieName || !password) {
  throw new Error("IRON_PASSWORD is not defined")
}

export default middleware<NextApiRequest, NextApiResponse>()
  .pipe(withIronSession({ password, cookieName }))
  .pipe((req, res, session) => {
    res.send(`Your session is: ${JSON.stringify(session)}`)
  })
```
