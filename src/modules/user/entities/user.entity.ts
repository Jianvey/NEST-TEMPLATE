import { ApiProperty } from "@nestjs/swagger"
import { Exclude, Transform } from "class-transformer"

import { OSS_KEYS } from "@/common/constants/oss-keys.constants"
import { Role } from "@/core/prisma/generators/enums"
import { joinUrl } from "@/tools/url"

export class UserEntity {
  @ApiProperty({ description: "用户ID" })
  @Transform(({ value }) => value.toString())
  userId!: string

  @ApiProperty({ description: "邮箱", example: "nest@example.com" })
  email!: string

  @ApiProperty({ description: "密码(包含大写字母、小写字母、数字和特殊字符, 长度8-32个字符)" })
  @Exclude()
  password!: string

  @ApiProperty({ description: "用户名", example: "Nest" })
  username!: string

  @ApiProperty({ description: "用户头像", example: "https://example.com/uploads/xxxx.png" })
  @Transform(({ value }) =>
    value
      ? joinUrl(process.env.ASSETS_PREFIX ?? "", `${value.split("@raw")[0]}.png`)
      : joinUrl(process.env.ASSETS_PREFIX ?? "", OSS_KEYS.system.avatar.defaultAvatar()),
  )
  avatar!: string

  @ApiProperty({ description: "角色", enum: Role, example: "USER" })
  role!: Role

  @ApiProperty({ description: "创建时间", example: "2025-01-01T12:00:00.000Z" })
  createdAt!: Date

  @ApiProperty({ description: "更新时间", example: "2025-01-02T12:00:00.000Z" })
  updatedAt!: Date
}
