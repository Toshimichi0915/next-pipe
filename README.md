# next-pipe

Provides a simple way to pipe data through a series of functions.

## Installation

```bash
npm install next-pipe
```

## Example

```ts
import express from "express"
import { NextPipe, middleware } from "../src"

const app = express()

app.get("/", middleware<express.Request, express.Response>()
  .pipe(async (req, res, next: NextPipe[string]) => {
    // user check middleware
    const userList = ["John", "Jane", "Jack"]
    if (req.query.user in userList) {
      await next(req.query.user)
    } else {
      res.status(400).send("Invalid user")
    }
  }, async (req, res, next: NextPipe<[string]>) => {
    // origin check middleware
    const originList = ["http://localhost", "https://example.com"]
    if (req.headers.origin in originList) {
      await next(req.query.origin)
    } else {
      res.status(400).send("Invalid origin")
    }
  })
  .pipe((req, res, next, name, origin) => {
    res.send(`Hello ${name} from ${origin}`)
  })
)
```
