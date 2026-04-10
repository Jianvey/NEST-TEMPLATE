import type { Request, Response } from "express"

import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { pick } from "radash"
import { Observable } from "rxjs"
import { mergeMap } from "rxjs/operators"

import { BaseResponse } from "@/common/dto/response/base.response"
import dayjs from "@/core/dayjs"
import { formatRequestLog } from "@/core/logger/logger.config"
import { LoggerService } from "@/core/logger/logger.service"

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<Partial<BaseResponse>>): Observable<BaseResponse> {
    const IS_DEVELOPMENT = this.configService.get<string>("NODE_ENV") === "development"
    const ctx = context.switchToHttp()
    const req = ctx.getRequest<Request>()
    const res = ctx.getResponse<Response>()
    const startTime = dayjs().valueOf()

    return next.handle().pipe(
      mergeMap(async (result: Partial<BaseResponse>): Promise<BaseResponse> => {
        const format = await formatRequestLog(req)
        const statusCode = res.statusCode || HttpStatus.OK
        const ms = `${dayjs().valueOf() - startTime}ms`

        if (IS_DEVELOPMENT) {
          this.logger.debug(`[${statusCode}] ${format.message} ${ms}`, pick(format.meta, ["🔍", "🧩", "📦"]))
        } else {
          this.logger.info(`${format.message} ${ms}`, { ...format.meta })
        }

        return {
          traceId: req.headers["x-trace-id"] ?? "",
          code: statusCode,
          message: result?.message ?? "Success",
          data: result?.data,
        }
      }),
    )
  }
}
