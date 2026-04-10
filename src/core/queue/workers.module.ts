import { Module } from "@nestjs/common"

import { MailModule } from "@/core/mail/mail.module"
import { ImageProcessor } from "@/core/queue/processors/image.processor"
import { MailProcessor } from "@/core/queue/processors/mail.processor"
import { FileModule } from "@/modules/file/file.module"

@Module({
  imports: [MailModule, FileModule],
  providers: [MailProcessor, ImageProcessor],
})
export class WorkersModule {}
