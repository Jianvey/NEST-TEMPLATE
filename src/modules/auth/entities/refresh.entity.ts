import { ApiProperty } from "@nestjs/swagger"

export class AuthRefreshEntity {
  @ApiProperty({ description: "访问令牌" })
  token!: string
}
