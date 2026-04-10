import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsEmail, IsString, Length, Matches } from "class-validator"

export class UpdateUserEmailDto {
  @ApiProperty({ description: "新邮箱", example: "nest2@example.com" })
  @IsEmail()
  newEmail!: string

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
}
