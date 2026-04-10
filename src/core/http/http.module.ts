import { HttpModule as NestHttpModule } from "@nestjs/axios"
import { Global, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { httpAgent, httpsAgent } from "@/core/http/http-agent"

@Global()
@Module({
  imports: [
    NestHttpModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (_configService: ConfigService) => {
        return { timeout: 5000, maxRedirects: 5, httpAgent, httpsAgent }
      },
    }),
  ],
  providers: [],
  exports: [],
})
export class HttpModule {}
