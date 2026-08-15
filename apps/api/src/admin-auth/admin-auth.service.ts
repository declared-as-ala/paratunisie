import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

export interface AdminJwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const staff = await this.prisma.staffUser.findUnique({ where: { email: dto.email } });
    if (!staff || !staff.isActive) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    const passwordMatches = await bcrypt.compare(dto.password, staff.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    const token = this.jwtService.sign({ sub: staff.id, role: staff.role } as AdminJwtPayload);
    return { token, staff: this.sanitize(staff) };
  }

  async findActiveStaffById(id: string) {
    const staff = await this.prisma.staffUser.findUnique({ where: { id } });
    if (!staff || !staff.isActive) return null;
    return staff;
  }

  verifyToken(token: string) {
    return this.jwtService.verify<AdminJwtPayload>(token);
  }

  sanitize<T extends { passwordHash: string }>(staff: T) {
    const { passwordHash: _passwordHash, ...rest } = staff;
    return rest;
  }
}
