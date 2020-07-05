import { Test, TestingModule } from '@nestjs/testing';
import { EmailDeliveryService } from './email-delivery.service';

describe('EmailDeliveryService', () => {
  let service: EmailDeliveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailDeliveryService],
    }).compile();

    service = module.get<EmailDeliveryService>(EmailDeliveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
