import { Module } from "@nestjs/common"
import { ScheduleModule as NestCacheModule } from "@nestjs/schedule"

import { BackupTaskService } from "@/core/schedule/tasks/backup.service"
import { FileModule } from "@/modules/file/file.module"

@Module({
  imports: [NestCacheModule.forRoot(), FileModule],
  providers: [BackupTaskService],
})
export class ScheduleModule {}
