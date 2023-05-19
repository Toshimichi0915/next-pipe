import { ExpressRequestLike, ExpressResponseLike } from "../../src"

export function createExpressRequest(def: Partial<ExpressRequestLike> = {}): ExpressRequestLike {
  return {
    method: "GET",
    body: undefined,
    ...def,
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
