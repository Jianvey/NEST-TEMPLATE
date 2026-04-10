import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsString, Length, Matches } from "class-validator"

export class UpdateUserDto {
  @ApiPropertyOptional({ description: "用户名", example: "Nest" })
  @IsOptional()
  @IsString()
  @Length(3, 11, { message: "用户名长度必须在3到11个字符之间" })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: "用户名只能包含字母、数字和下划线" })
  username?: string
}
