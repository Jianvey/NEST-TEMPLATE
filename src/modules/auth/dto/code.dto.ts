import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsString } from "class-validator"

export enum AuthCodeScene {
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
  RESET_PASSWORD = "RESET_PASSWORD",
  UPDATE_PHONE = "UPDATE_PHONE",
  UPDATE_EMAIL = "UPDATE_EMAIL",
}

export class AuthCodeDto {
  @ApiProperty({ description: "验证码场景", enum: AuthCodeScene, example: AuthCodeScene.LOGIN })
  @IsEnum(AuthCodeScene)
  scene!: AuthCodeScene

  @ApiProperty({ description: "联系方式", example: "nest@example.com" })
  @IsString()
  contact!: string
}
