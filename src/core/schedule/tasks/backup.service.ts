import type Redlock from "redlock"

import { Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Cron, CronExpression } from "@nestjs/schedule"
import { spawn } from "child_process"
import { createWriteStream, promises as fs } from "fs"
import { join } from "path"

import { OSS_KEYS } from "@/common/constants/oss-keys.constants"
import { CACHE_KEYS } from "@/common/constants/redis-keys.constants"
import { REDLOCK_CLIENT } from "@/common/constants/redis.constants"
import dayjs, { DEFAULT_TIMEZONE } from "@/core/dayjs"
import { LoggerService } from "@/core/logger/logger.service"
import { FileService } from "@/modules/file/file.service"

@Injectable()
export class BackupTaskService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(REDLOCK_CLIENT) private readonly redlock: Redlock,
    private readonly loggerService: LoggerService,
    private readonly fileService: FileService,
  ) {}

  /** 每隔 12 小时执行一次数据库备份 */
  @Cron(CronExpression.EVERY_12_HOURS)
  async handleDatabaseBackup() {
    const LOCK_KEY = CACHE_KEYS.schedule.backup("MYSQL")
    const host = this.configService.get<string>("DB_HOST")!
    const port = this.configService.get<string>("DB_PORT")!
    const user = this.configService.get<string>("DB_USERNAME")!
    const password = this.configService.get<string>("DB_PASSWORD")!
    const database = this.configService.get<string>("DB_NAME")!

    const tempDir = join(process.cwd(), "temp")
    const fileName = `${dayjs().tz(DEFAULT_TIMEZONE).format("YYYYMMDD_HHmmss_SSS")}.sql`
    const filePath = join(tempDir, fileName)
    let lock: Awaited<ReturnType<Redlock["acquire"]>> | undefined

    try {
      lock = await this.redlock.acquire([LOCK_KEY], 12 * 60 * 60 * 1000)
      await fs.mkdir(tempDir, { recursive: true })
      const dump = spawn("mysqldump", [`-h${host}`, `-P${port}`, `-u${user}`, "--single-transaction", database], {
        env: { ...process.env, MYSQL_PWD: password },
      })

      const writeStream = createWriteStream(filePath)
      dump.stdout.pipe(writeStream)

      await new Promise<void>((resolve, reject) => {
        dump.on("error", reject)
        writeStream.on("error", reject)
        dump.on("close", code => (code === 0 ? resolve() : reject(new Error(`mysqldump exited with code ${code}`))))
      })

      const buffer = await fs.readFile(filePath)
      await this.fileService.uploadFile(buffer, `${OSS_KEYS.backup.mysql(fileName)}`, "application/sql")
    } catch (error: unknown) {
      const stack = error instanceof Error ? error.stack : undefined
      const message = error instanceof Error ? error.message : String(error)
      this.loggerService.error(stack || message)
    } finally {
      const cleanupTasks: Promise<unknown>[] = [fs.rm(filePath, { force: true })]
      if (lock) cleanupTasks.push(lock.release())

      const cleanupResults = await Promise.allSettled(cleanupTasks)
      for (const result of cleanupResults) {
        if (result.status === "rejected") {
          const message = result.reason instanceof Error ? result.reason.message : String(result.reason)
          this.loggerService.warn(`Database backup cleanup failed: ${message}`)
        }
      }
    }
  }
}
