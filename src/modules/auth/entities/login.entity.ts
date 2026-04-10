import { ApiProperty } from "@nestjs/swagger"

import { UserEntity } from "@/modules/user/entities/user.entity"

export class AuthLoginEntity {
  @ApiProperty({ description: "用户信息", type: UserEntity })
  user!: UserEntity

  @ApiProperty({ description: "访问令牌" })
  token!: string
}
