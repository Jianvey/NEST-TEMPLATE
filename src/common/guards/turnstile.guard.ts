import { HttpService } from "@nestjs/axios"
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { firstValueFrom } from "rxjs"

@Injectable()
export class TurnstileGuard implements CanActivate {
  private readonly secret: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.secret = this.configService.get<string>("CLOUDFLARE_TURNSTILE_SECRET")!
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const token = request.body["turnstile"]
    if (!token) throw new ForbiddenException("Security check required: Missing Turnstile token.")

    try {
      const { data } = await firstValueFrom(
        this.httpService.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          secret: this.secret,
          response: token,
          remoteip: request.headers["cf-connecting-ip"] || request.ip,
        }),
      )

      if (data.success) return true
      throw new ForbiddenException("Security check failed: Invalid or expired token.")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Security check service is currently unavailable."
      throw new ForbiddenException(message)
    }
  }
}
