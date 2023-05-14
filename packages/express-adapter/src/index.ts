import express from "express"
import { middleware, NextPipe, MiddlewareChain } from "next-pipe"

export function expressMiddleware(): MiddlewareChain<express.Request, express.Response, [], []> {
  return middleware<express.Request, express.Response, []>()
}

const app = express()

app.get(
  "/",
  expressMiddleware()
    .pipe(
      async (req, res, next: NextPipe<[string, string]>) => {
        await next("Hello", "World")
      },
      async (req, res, next: NextPipe<[string]>) => {
        await next("Toshimichi!")
      }
    )
    .pipe((req, res, next, message1, message2, name) => {
      res.send(`${message1} ${message2} ${name}`)
    })
)

app.listen(3000, () => {
  console.log("Example app listening on port 3000!")
})
