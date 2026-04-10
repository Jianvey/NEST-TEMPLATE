import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator"

export class BasePageQueryDto {
  @ApiPropertyOptional({ description: "当前页码", default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @ApiPropertyOptional({ description: "每页记录数", default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10

  @ApiPropertyOptional({ description: "搜索关键字" })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: "排序字段，例如 createdAt", default: "createdAt" })
  @IsOptional()
  @IsString()
  orderBy?: string

  @ApiPropertyOptional({ description: "排序方式", enum: ["ASC", "DESC"], default: "DESC" })
  @IsOptional()
  @IsIn(["ASC", "DESC"])
  order: "ASC" | "DESC" = "DESC"
}
