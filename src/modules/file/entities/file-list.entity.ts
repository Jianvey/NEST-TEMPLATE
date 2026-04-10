import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class FileListEntity {
  @ApiProperty({ description: "对象路径" })
  path!: string

  @ApiProperty({ description: "完整访问地址" })
  url!: string

  @ApiPropertyOptional({ description: "文件大小（字节）" })
  size?: number

  @ApiPropertyOptional({ description: "最后修改时间" })
  lastModified?: Date
}
