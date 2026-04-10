import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Queue } from "bullmq"
import { promises as fs } from "fs"
import Handlebars from "handlebars"
import { extname, join, resolve } from "path"
import { Resend } from "resend"

import { QUEUE_PROCESSORS } from "@/common/constants/queue-processors.constants"
import { MailJobPayload } from "@/core/mail/mail.interface"

@Injectable()
export class MailService implements OnModuleInit {
  private resend: Resend
  private templates: Record<string, Handlebars.TemplateDelegate> = {}

  constructor(
    @InjectQueue("mail") private readonly mailQueue: Queue<MailJobPayload>,
    private readonly configService: ConfigService,
  ) {
    this.resend = new Resend(this.configService.get<string>("MAIL_API_KEY"))
  }

  async onModuleInit() {
    await this.loadTemplates()
  }

  private async loadTemplates() {
    const templatesDir = resolve(__dirname, "./templates")
    const files = await fs.readdir(templatesDir)

    for (const file of files) {
      if (extname(file) !== ".hbs") continue
      const filePath = join(templatesDir, file)
      const name = file.replace(/\.hbs$/i, "")
      const source = await fs.readFile(filePath, "utf-8")
      this.templates[name] = Handlebars.compile(source, { noEscape: false })
    }
  }

  private renderTemplate(template: string, variables?: MailJobPayload["variables"]) {
    const compiled: Handlebars.TemplateDelegate = this.templates[template]
    if (!compiled) throw new Error(`模板 ${template} 不存在`)
    return compiled(variables || {})
  }

  async enqueue(payload: MailJobPayload) {
    return await this.mailQueue.add(QUEUE_PROCESSORS["SEND_MAIL"], payload, {
      attempts: 3,
      backoff: 5000,
      removeOnComplete: true,
    })
  }

  async send({ to, subject, template = "base", variables }: MailJobPayload): Promise<string> {
    const html = this.renderTemplate(template, variables)
    const MAIL_FROM = this.configService.get<string>("MAIL_FROM")!

    const result = await this.resend.emails.send({ from: MAIL_FROM, to, subject, html })

    if (result.error) throw new Error(result.error.message)
    return result.data.id
  }
}
