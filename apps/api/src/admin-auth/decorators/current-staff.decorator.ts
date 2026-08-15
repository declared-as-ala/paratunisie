import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { StaffUser } from "@prisma/client";

// Populated by AdminAuthGuard. Use in any controller guarded by it to access
// the authenticated staff member without re-reading the cookie/JWT.
export const CurrentStaff = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Omit<StaffUser, "passwordHash"> => {
    const request = ctx.switchToHttp().getRequest();
    return request.staffUser;
  },
);
