import type { NextFunction, Request, Response } from "express"

import { randomUUID } from "crypto"

export function traceIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const traceId = req.headers["x-trace-id"] ?? randomUUID()

  req.headers["x-trace-id"] = traceId
  res.setHeader("x-trace-id", traceId)

  next()
}
