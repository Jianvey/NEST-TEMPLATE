import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, IsEnum, IsOptional, IsString, IsStrongPassword, Length, Matches, MaxLength } from "class-validator"

import { Role } from "@/core/prisma/generators/enums"

export class CreateUserDto {
  @ApiProperty({ description: "邮箱", example: "nest@example.com" })
  @IsEmail()
  email!: string

  @ApiProperty({ description: "用户名", example: "Nest" })
  @IsString()
  @Length(3, 11, { message: "用户名长度必须在3到11个字符之间" })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: "用户名只能包含字母、数字和下划线" })
  username!: string

  @ApiProperty({ description: "密码", example: "StrongP@ssw0rd!" })
  @IsStrongPassword(
    { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    { message: "密码强度不足, 必须包含大写字母、小写字母、数字和特殊字符, 且长度不少于8位" },
  )
  @MaxLength(32, { message: "密码长度不能超过32个字符" })
  password!: string

  @ApiPropertyOptional({ description: "角色", enum: Role, default: Role.USER })
  @IsOptional()
  @IsEnum(Role)
  role: Role = Role.USER
}
