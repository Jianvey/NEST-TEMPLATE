import { Module } from "@nestjs/common"
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core"

import { CacheModule } from "@/core/cache/cache.module"
import { ConfigModule } from "@/core/config/config.module"
import { CatchExceptionFilter } from "@/core/filters/catch-exception.filter"
import { HttpModule } from "@/core/http/http.module"
import { TransformResponseInterceptor } from "@/core/interceptors/transform-response.interceptor"
import { JwtAuthGuard } from "@/core/jwt/guards/jwt-auth.guard"
import { RolesGuard } from "@/core/jwt/guards/roles.guard"
import { LoggerModule } from "@/core/logger/logger.module"
import { GlobalValidationPipe } from "@/core/pipes/validation.pipe"
import { PrismaModule } from "@/core/prisma/prisma.module"
import { QueueModule } from "@/core/queue/queue.module"
import { WorkersModule } from "@/core/queue/workers.module"
import { RedisModule } from "@/core/redis/redis.module"
import { ScheduleModule } from "@/core/schedule/schedule.module"
import { ThrottlerModule } from "@/core/throttler/throttler.module"
import { AuthModule } from "@/modules/auth/auth.module"
import { FileModule } from "@/modules/file/file.module"
import { UserModule } from "@/modules/user/user.module"

@Module({
  imports: [
    ConfigModule,
    ScheduleModule,
    ThrottlerModule,
    LoggerModule,
    PrismaModule,
    HttpModule,
    RedisModule,
    CacheModule,
    QueueModule,
    WorkersModule,
    AuthModule,
    FileModule,
    UserModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_PIPE, useValue: GlobalValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_FILTER, useClass: CatchExceptionFilter },
  ],
})
export class AppModule {}
