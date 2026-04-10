import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, IsIn, IsOptional, IsString, Length, Matches } from "class-validator"

import { Role } from "@/core/prisma/generators/enums"

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ description: "用户名", example: "Nest" })
  @IsOptional()
  @IsString()
  @Length(3, 11, { message: "用户名长度必须在3到11个字符之间" })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: "用户名只能包含字母、数字和下划线" })
  username?: string

  @ApiPropertyOptional({ description: "邮箱" })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ description: "角色", enum: Role })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(Role))
  role?: Role
}
