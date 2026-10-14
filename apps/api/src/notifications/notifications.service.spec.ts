import { NotificationType } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { Global, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './notifications.module';
import { PrismaService } from '../prisma/prisma.service';

@Global()
@Module({ providers: [{ provide: PrismaService, useValue: {} }], exports: [PrismaService] })
class TestDatabaseModule {}

@Module({ imports: [TestDatabaseModule, NotificationsModule] })
class NotificationTestApp {}

describe('Order notification routing', () => {
  const previousAdmin = process.env.ADMIN_EMAIL;
  afterEach(() => {
    if (previousAdmin === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = previousAdmin;
    jest.restoreAllMocks();
  });

  it('initializes the notification module with its authentication dependencies', async () => {
    const app = await NestFactory.createApplicationContext(NotificationTestApp, { logger: false, abortOnError: false });
    expect(app.get(NotificationsService)).toBeDefined();
    await app.close();
  });

  it('does not send synthetic notifications for a missing order', async () => {
    const sms = { sendSms: jest.fn() };
    const email = { sendEmail: jest.fn() };
    const service = new NotificationsService({ order: { findUnique: jest.fn().mockResolvedValue(null) } } as any, sms as any, email as any);
    await service.processOrderNotifications('missing', NotificationType.ORDER_CREATED);
    expect(sms.sendSms).not.toHaveBeenCalled();
    expect(email.sendEmail).not.toHaveBeenCalled();
  });

  it('still sends customer and admin email when the SMS channel throws', async () => {
    process.env.ADMIN_EMAIL = 'admin@example.com';
    const service = new NotificationsService({} as any, {} as any, {} as any);
    jest.spyOn(service as any, 'fetchNotificationOrderData').mockResolvedValue({ id: 'order-1', customerPhone: '20000000', customerEmail: 'client@example.com' });
    const sms = jest.spyOn(service as any, 'deliverSmsNotification').mockRejectedValue(new Error('provider unavailable'));
    const email = jest.spyOn(service as any, 'deliverEmailNotification').mockResolvedValue(undefined);
    await service.processOrderNotifications('order-1', NotificationType.ORDER_CREATED);
    expect(sms).toHaveBeenCalledTimes(1);
    expect(email).toHaveBeenCalledTimes(2);
    expect(email.mock.calls[0][2]).toBe(false);
    expect(email.mock.calls[1].slice(2)).toEqual([true, 'admin@example.com']);
  });
});
