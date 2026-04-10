import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsEmail, IsString, IsStrongPassword, Length, Matches, MaxLength } from "class-validator"

export class ResetUserPasswordDto {
  @ApiProperty({ description: "邮箱", example: "nest@example.com" })
  @IsEmail()
  email!: string

  @ApiProperty({
    description: "验证码",
    oneOf: [
      { type: "string", example: "123456" },
      { type: "number", example: 123456 },
    ],
  })
  @Transform(({ value }) => String(value).trim())
  @IsString()
  @Length(6, 6, { message: "Code must be 6 characters long" })
  @Matches(/^\d{6}$/, { message: "Code must be a 6-digit number" })
  code!: string

  @ApiProperty({ description: "新密码", example: "StrongP@ssw0rd!" })
  @IsStrongPassword(
    { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    { message: "密码强度不足, 必须包含大写字母、小写字母、数字和特殊字符, 且长度不少于8位" },
  )
  @MaxLength(32, { message: "密码长度不能超过32个字符" })
  newPassword!: string
}
