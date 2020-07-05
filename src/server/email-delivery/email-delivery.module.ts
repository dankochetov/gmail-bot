import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailDeliveryController } from './email-delivery.controller';
import { EmailDeliveryService } from './email-delivery.service';
import EmailDelivery from './email-delivery.entity';
import EmailDeliveryRepository from './email-delivery.repository';
import { GoogleModule } from '@/server/google/google.module';
import { AuthModule } from '@/server/auth/auth.module';
import { UserModule } from '@/server/user/user.module';
import { EmailDeliveryRecipientModule } from '@/server/email-delivery-recipient/email-delivery-recipient.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([EmailDelivery, EmailDeliveryRepository]),
        GoogleModule,
        AuthModule,
        UserModule,
        EmailDeliveryRecipientModule,
    ],
    controllers: [EmailDeliveryController],
    providers: [EmailDeliveryService],
    exports: [TypeOrmModule],
})
export class EmailDeliveryModule {}
