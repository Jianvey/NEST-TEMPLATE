import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Injectable } from "@nestjs/common"
import { Job } from "bullmq"
import sharp from "sharp"

import { QUEUE_PROCESSORS } from "@/common/constants/queue-processors.constants"
import { FileService } from "@/modules/file/file.service"

export interface JobPayload {
  filepath: string
}

@Processor("image")
@Injectable()
export class ImageProcessor extends WorkerHost {
  constructor(private readonly fileService: FileService) {
    super()
  }

  async process(job: Job<JobPayload>): Promise<void> {
    if (job.name === QUEUE_PROCESSORS["AVATAR_RESIZE"]) {
      const source = await this.fileService.downloadFile(job.data.filepath)
      const buffer = await sharp(source).resize(256, 256).png({ compressionLevel: 9 }).toBuffer()
      await this.fileService.uploadFile(buffer, `${job.data.filepath.split("@raw")[0]}.png`, "image/png")
    }
  }
}
