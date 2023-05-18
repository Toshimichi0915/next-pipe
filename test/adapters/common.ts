import { ExpressRequestLike, ExpressResponseLike } from "../../src"

export function createExpressRequest(body: unknown): ExpressRequestLike {
  return {
    body,
  }
}

class ExpressResponse implements ExpressResponseLike {
  currentStatus: number | undefined
  currentBody: unknown

  status(status: number): ExpressResponseLike {
    this.currentStatus = status
    return this
  }

  json(body: unknown): ExpressResponseLike {
    this.currentBody = body
    return this
  }
}

export function createExpressResponse(): ExpressResponse {
  return new ExpressResponse()
}
