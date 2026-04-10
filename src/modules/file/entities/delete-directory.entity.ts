import { ApiProperty } from "@nestjs/swagger"

export class DeleteDirectoryEntity {
  @ApiProperty({ description: "被删除目录前缀" })
  directory!: string

  @ApiProperty({ description: "删除文件数量" })
  deletedCount!: number
}
