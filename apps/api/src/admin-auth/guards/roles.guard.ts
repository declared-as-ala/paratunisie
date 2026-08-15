import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";

// Runs after AdminAuthGuard — relies on request.staffUser already being populated.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const staffRole: Role | undefined = request.staffUser?.role;
    if (!staffRole || !requiredRoles.includes(staffRole)) {
      throw new ForbiddenException("Rôle insuffisant pour cette action");
    }
    return true;
  }
}
