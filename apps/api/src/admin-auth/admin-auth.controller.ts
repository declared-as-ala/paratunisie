import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { AdminAuthService } from "./admin-auth.service";
import { LoginDto } from "./dto/login.dto";
import { AdminAuthGuard } from "./guards/admin-auth.guard";
import { CurrentStaff } from "./decorators/current-staff.decorator";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_MS } from "./admin-auth.constants";

@Controller("admin-auth")
export class AdminAuthController {
  constructor(private adminAuthService: AdminAuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, staff } = await this.adminAuthService.login(dto);
    res.cookie(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ADMIN_SESSION_MAX_AGE_MS,
    });
    return staff;
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ADMIN_SESSION_COOKIE);
    return { success: true };
  }

  @UseGuards(AdminAuthGuard)
  @Get("me")
  me(@CurrentStaff() staff: unknown) {
    return staff;
  }
}
