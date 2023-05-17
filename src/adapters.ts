export interface RequestLike {
  body: unknown
}

export interface ResponseLike {
  status: (code: number) => ResponseLike
  json: (body: object) => ResponseLike
}
