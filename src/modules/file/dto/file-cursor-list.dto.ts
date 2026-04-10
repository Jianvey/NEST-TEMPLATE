import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator"

export class FileCursorListDto {
  @ApiPropertyOptional({ description: "目录前缀（例如 avatar/user/123）" })
  @IsOptional()
  @IsString()
  directory?: string

  @ApiPropertyOptional({ description: "上一页返回的游标" })
  @IsOptional()
  @IsString()
  continuationToken?: string

  @ApiPropertyOptional({ description: "每页条数", default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10
}
