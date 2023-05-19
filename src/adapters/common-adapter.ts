export interface ExpressRequestLike {
  body: unknown
}

export interface ExpressResponseLike {
  status: (code: number) => ExpressResponseLike
  json: (body: unknown) => ExpressResponseLike
}
