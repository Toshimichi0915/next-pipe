# next-pipe

Provides a simple way to pipe data through a series of functions.

## Installation

```bash
npm install next-pipe
```

## Example

```ts
import express from "express"
import { z } from "zod"
import { middleware, withValidatedBody } from "../src"

const app = express()

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
})

app.get(
  "/",
  middleware<express.Request, express.Response>()
    .pipe(withValidatedBody(userSchema))
    .pipe((req, res, next, data) => {
      res.send(`Hello ${data.name}(${data.age})!`)
    })
)

app.listen(3000)
```
