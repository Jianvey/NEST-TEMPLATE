import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength } from "class-validator"

export class DeleteFileDto {
  @ApiProperty({ description: "要删除的文件路径", example: "avatar/user/123/avatar@raw.png" })
  @IsString()
  @MaxLength(500)
  path!: string
}
