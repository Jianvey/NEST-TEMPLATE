import { AuthCodeScene } from "@/modules/auth/dto/code.dto"

export const CACHE_KEYS = {
  schedule: {
    backup: (type: string) => `schedule:backup:${type}`,
  },
  token: {
    refresh: (userId: string) => `auth:refresh:${userId}`,
    blockedAccess: (jti: string) => `auth:blocked:access:${jti}`,
  },
  auth: {
    code: (scene: AuthCodeScene, contact: string) => `auth:code:${scene}:${contact}`,
  },
  user: {
    byUserId: (userId: bigint) => `user:info:userId:${userId}`,
    byEmail: (email: string) => `user:info:email:${email}`,
  },
}
