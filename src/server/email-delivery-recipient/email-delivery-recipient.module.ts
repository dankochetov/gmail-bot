import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailDeliveryRecipientService } from './email-delivery-recipient.service';
import EmailDeliveryRecipient from './email-delivery-recipient.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EmailDeliveryRecipient])],
    providers: [EmailDeliveryRecipientService],
    exports: [TypeOrmModule],
})
export class EmailDeliveryRecipientModule {}
