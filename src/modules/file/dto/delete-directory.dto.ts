import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength } from "class-validator"

export class DeleteDirectoryDto {
  @ApiProperty({ description: "要删除的目录前缀（例如 avatar/user/123）", example: "avatar/user/123" })
  @IsString()
  @MaxLength(255)
  directory!: string
}
