import { Module } from "@nestjs/common"

import { JwtModule } from "@/core/jwt/jwt.module"
import { MailModule } from "@/core/mail/mail.module"
import { AuthController } from "@/modules/auth/auth.controller"
import { AuthService } from "@/modules/auth/auth.service"
import { UserModule } from "@/modules/user/user.module"

@Module({
  imports: [JwtModule, MailModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
