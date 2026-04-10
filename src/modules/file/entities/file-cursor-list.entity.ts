import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"

import { FileListEntity } from "@/modules/file/entities/file-list.entity"

export class FileCursorListEntity {
  @ApiProperty({ description: "列表数据", type: [FileListEntity] })
  @Type(() => FileListEntity)
  list!: FileListEntity[]

  @ApiProperty({ description: "每页条数" })
  pageSize!: number

  @ApiProperty({ description: "是否还有更多数据" })
  hasMore!: boolean

  @ApiPropertyOptional({ description: "下一页游标" })
  nextContinuationToken?: string
}
