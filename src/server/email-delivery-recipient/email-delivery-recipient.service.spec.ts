import { Test, TestingModule } from '@nestjs/testing';
import { EmailDeliveryRecipientService } from './email-delivery-recipient.service';

describe('EmailDeliveryRecipientService', () => {
    let service: EmailDeliveryRecipientService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EmailDeliveryRecipientService],
        }).compile();

        service = module.get<EmailDeliveryRecipientService>(
            EmailDeliveryRecipientService,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
