import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq"
import { Injectable } from "@nestjs/common"
import { Job } from "bullmq"

import { QUEUE_PROCESSORS } from "@/common/constants/queue-processors.constants"
import { LoggerService } from "@/core/logger/logger.service"
import { MailJobPayload } from "@/core/mail/mail.interface"
import { MailService } from "@/core/mail/mail.service"

@Processor("mail")
@Injectable()
export class MailProcessor extends WorkerHost {
  constructor(
    private readonly mailService: MailService,
    private readonly loggerService: LoggerService,
  ) {
    super()
  }

  async process(job: Job<MailJobPayload>) {
    if (job.name === QUEUE_PROCESSORS["SEND_MAIL"]) await this.mailService.send(job.data)
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job, err: Error) {
    this.loggerService.error(`❌ Mail failed: Job ${job.id}`, err.message)
  }
}
