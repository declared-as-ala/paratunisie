import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AdminAuthService, AdminJwtPayload } from "../admin-auth.service";
import { ADMIN_SESSION_COOKIE } from "../admin-auth.constants";

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private adminAuthService: AdminAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.[ADMIN_SESSION_COOKIE];
    if (!token) throw new UnauthorizedException("Session admin requise");

    let payload: AdminJwtPayload;
    try {
      payload = this.adminAuthService.verifyToken(token);
    } catch {
      throw new UnauthorizedException("Session admin invalide ou expirée");
    }

    const staff = await this.adminAuthService.findActiveStaffById(payload.sub);
    if (!staff) throw new UnauthorizedException("Compte administrateur introuvable ou désactivé");

    request.staffUser = this.adminAuthService.sanitize(staff);
    return true;
  }
}
