import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { type Request } from "express"

import { ROLES_KEY } from "@/core/jwt/decorators/roles.decorator"
import { SKIP_AUTH_KEY } from "@/core/jwt/decorators/skip-auth.decorator"
import { Role } from "@/core/prisma/generators/enums"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [ctx.getHandler(), ctx.getClass()])
    if (isSkipAuth) return true

    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()])
    if (!roles) return true

    const request = ctx.switchToHttp().getRequest<Request>()

    return roles.includes(request.user?.role)
  }
}
