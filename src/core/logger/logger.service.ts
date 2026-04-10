import type { Logger as WinstonLogger } from "winston"

import { Inject, Injectable } from "@nestjs/common"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"

@Injectable()
export class LoggerService {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger) {}

  debug(msg: string, meta?: unknown) {
    this.logger.debug(msg, meta)
  }

  info(msg: string, meta?: unknown) {
    this.logger.info(msg, meta)
  }

  warn(msg: string, meta?: unknown) {
    this.logger.warn(msg, meta)
  }

  error(msg: string, meta?: unknown) {
    this.logger.error(msg, meta)
  }
}
