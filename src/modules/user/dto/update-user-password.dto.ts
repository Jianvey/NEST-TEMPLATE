import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsStrongPassword, MaxLength } from "class-validator"

export class UpdateUserPasswordDto {
  @ApiProperty({ description: "旧密码" })
  @IsString()
  oldPassword!: string

  @ApiProperty({ description: "新密码", example: "StrongP@ssw0rd!" })
  @IsStrongPassword(
    { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    { message: "密码强度不足, 必须包含大写字母、小写字母、数字和特殊字符, 且长度不少于8位" },
  )
  @MaxLength(32, { message: "密码长度不能超过32个字符" })
  newPassword!: string
}
