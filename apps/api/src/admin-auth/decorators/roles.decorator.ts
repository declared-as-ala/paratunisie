import { SetMetadata } from "@nestjs/common";
import { Role } from "@prisma/client";

export const ROLES_KEY = "roles";

// Applied alongside AdminAuthGuard/RolesGuard. Omit to allow any authenticated
// StaffUser; list specific roles to restrict a mutating endpoint further.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
