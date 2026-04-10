import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsEmail, IsString, Length, Matches } from "class-validator"

export class AuthLoginDto {
  @ApiProperty({ description: "邮箱", example: "nest@example.com" })
  @IsEmail()
  email!: string

  @ApiProperty({ description: "密码(包含大写字母、小写字母、数字和特殊字符, 长度8-32个字符)" })
  @IsString()
  password!: string

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

  @ApiProperty({ description: "Turnstile response value", example: "token_from_turnstile" })
  @IsString()
  turnstile!: string
}
