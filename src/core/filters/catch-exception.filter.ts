import type { Request, Response } from "express"

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common"
import { isString } from "radash"

import { BaseResponse } from "@/common/dto/response/base.response"
import { formatRequestLog } from "@/core/logger/logger.config"
import { LoggerService } from "@/core/logger/logger.service"

function resolveHttpExceptionMessage(exception: HttpException): string | string[] {
  const httpResponse = exception.getResponse()

  if (isString(httpResponse)) return httpResponse
  if (httpResponse && typeof httpResponse === "object" && "message" in httpResponse) {
    const { message } = httpResponse as { message?: string | string[] }
    return message ?? exception.message
  }

  return exception.message
}

@Catch()
export class CatchExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const req = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = "Internal Server Error"

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      message = resolveHttpExceptionMessage(exception)
    } else if (exception instanceof Error) {
      message = exception.message
    }

    const format = await formatRequestLog(req)
    this.logger.error(format.message, {
      ...format.meta,
      ["🔥"]: exception instanceof Error ? exception.stack : JSON.stringify(exception),
    })

    const result: BaseResponse = {
      traceId: req.headers["x-trace-id"] ?? "",
      code: status,
      message,
      data: null,
    }

    return response.status(status).json(result)
  }
}
