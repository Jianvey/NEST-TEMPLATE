import { SetMetadata } from "@nestjs/common"

export const SKIP_AUTH_KEY = "skip-auth"
/** 跳过JWT认证 */
export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true)
