import { Role } from "@/core/prisma/generators/enums"

export interface JWTPayload {
  sub: string
  jti: string
  role?: Role
}
