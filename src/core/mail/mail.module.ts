import { Module } from "@nestjs/common"

import { MailService } from "@/core/mail/mail.service"

@Module({
  imports: [],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
