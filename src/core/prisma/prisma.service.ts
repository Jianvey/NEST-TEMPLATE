import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

import { PrismaClient } from "@/core/prisma/generators/client"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaMariaDb({
      host: configService.get<string>("DB_HOST"),
      port: configService.get<number>("DB_PORT"),
      user: configService.get<string>("DB_USERNAME"),
      password: configService.get<string>("DB_PASSWORD"),
      database: configService.get<string>("DB_NAME"),
    })

    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
