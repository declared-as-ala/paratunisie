import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AdminCustomersQueryDto } from "./dto/admin-customers-query.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async registerCustomer(data: { email: string; name: string; phone?: string; password: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new BadRequestException("Un compte avec cette adresse e-mail existe déjà.");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    // Create initial loyalty account with 0 points
    await this.prisma.loyaltyAccount.create({
      data: {
        userId: user.id,
        points: 0,
        tier: "Bronze",
      },
    }).catch(() => {});

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    };
  }

  async loginCustomer(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException("Identifiants incorrects.");
    }

    // Support both hashed passwords and legacy plaintext
    let passwordValid = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      passwordValid = await bcrypt.compare(data.password, user.password);
    } else {
      passwordValid = user.password === data.password;
    }

    if (!passwordValid) {
      throw new UnauthorizedException("Identifiants incorrects.");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    };
  }

  async createCustomer(data: { email: string; name?: string; password: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name,
        password: data.password,
        role: "CUSTOMER",
      },
    });
  }

  async getCustomerById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        addresses: true,
        loyalty: {
          include: {
            transactions: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId } });
  }

  async addAddress(userId: string, data: { gouvernorat: string; fullAddress: string; label?: string; isDefault?: boolean }) {
    return this.prisma.address.create({
      data: { userId, ...data },
    });
  }

  async getAdminCustomers(query: AdminCustomersQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const search = query.search?.trim();
    const where = {
      role: "CUSTOMER",
      orders: {
        some: query.governorate ? { gouvernorat: query.governorate } : {},
      },
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      } : {}),
    };

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            totalMillimes: true,
            gouvernorat: true,
            createdAt: true,
            items: { select: { quantity: true } },
          },
        },
      },
    });

    const mapped = users.map((user) => {
      const ordersCount = user.orders.length;
      const totalSpentMillimes = user.orders.reduce((sum, order) => sum + order.totalMillimes, 0);
      return {
        ...user,
        ordersCount,
        totalSpentMillimes,
        averageBasketMillimes: ordersCount ? Math.round(totalSpentMillimes / ordersCount) : 0,
        lastOrderDate: user.orders[0]?.createdAt ?? null,
        governorates: [...new Set(user.orders.map((order) => order.gouvernorat))],
      };
    });

    mapped.sort((a, b) => {
      if (query.sort === "oldest") return +new Date(a.lastOrderDate ?? 0) - +new Date(b.lastOrderDate ?? 0);
      if (query.sort === "orders") return b.ordersCount - a.ordersCount;
      if (query.sort === "spent") return b.totalSpentMillimes - a.totalSpentMillimes;
      if (query.sort === "name") return (a.name ?? a.email).localeCompare(b.name ?? b.email, "fr");
      return +new Date(b.lastOrderDate ?? 0) - +new Date(a.lastOrderDate ?? 0);
    });

    const allBuyers = await this.prisma.user.findMany({
      where: { role: "CUSTOMER", orders: { some: {} } },
      select: { orders: { select: { totalMillimes: true, gouvernorat: true } } },
    });
    const totalRevenueMillimes = allBuyers.reduce(
      (sum, user) => sum + user.orders.reduce((orderSum, order) => orderSum + order.totalMillimes, 0),
      0,
    );
    const totalOrders = allBuyers.reduce((sum, user) => sum + user.orders.length, 0);
    const governorates = [...new Set(allBuyers.flatMap((user) => user.orders.map((order) => order.gouvernorat)))].sort();
    const total = mapped.length;

    return {
      items: mapped.slice((page - 1) * pageSize, page * pageSize),
      stats: {
        totalCustomers: allBuyers.length,
        repeatCustomers: allBuyers.filter((user) => user.orders.length > 1).length,
        totalRevenueMillimes,
        averageBasketMillimes: totalOrders ? Math.round(totalRevenueMillimes / totalOrders) : 0,
      },
      governorates,
      pagination: { page, pageSize, total, pageCount: Math.max(1, Math.ceil(total / pageSize)) },
    };
  }
}
