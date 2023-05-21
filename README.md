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
import { middleware, withValidatedBody, withMethods } from "next-pipe"

const app = express()

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
})

app.get(
  "/",
  middleware<express.Request, express.Response>()
    .pipe(withValidatedBody(userSchema))
    .pipe(
      withMethods(({ post }) => {
        post().pipe((req, res, body) => {
          return `Hello, ${body.name}!`
        })
      })
    )
)

app.listen(3000)
```
