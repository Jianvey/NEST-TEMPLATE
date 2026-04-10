import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsIn, IsOptional, IsString } from "class-validator"

import { BasePageQueryDto } from "@/common/dto/query/base.query"
import { Role } from "@/core/prisma/generators/enums"

export const USER_LIST_ORDER_BY_FIELDS = ["createdAt", "updatedAt", "email", "username", "role"] as const
export type UserListOrderBy = (typeof USER_LIST_ORDER_BY_FIELDS)[number]

export class UserPageQueryDto extends BasePageQueryDto {
  @ApiPropertyOptional({ description: "排序字段", enum: USER_LIST_ORDER_BY_FIELDS, default: "createdAt" })
  @IsOptional()
  @IsString()
  @IsIn(USER_LIST_ORDER_BY_FIELDS)
  declare orderBy?: UserListOrderBy

  @ApiPropertyOptional({ description: "角色筛选", enum: Role })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(Role))
  role?: Role
}
