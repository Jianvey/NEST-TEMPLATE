import { Module } from "@nestjs/common"

import { JwtModule } from "@/core/jwt/jwt.module"
import { MailModule } from "@/core/mail/mail.module"
import { FileModule } from "@/modules/file/file.module"
import { UserController } from "@/modules/user/user.controller"
import { UserRepository } from "@/modules/user/user.repository"
import { UserService } from "@/modules/user/user.service"

@Module({
  imports: [JwtModule, MailModule, FileModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
