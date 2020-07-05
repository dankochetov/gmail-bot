import { Test, TestingModule } from '@nestjs/testing';
import { EmailDeliveryController } from './email-delivery.controller';

describe('EmailDelivery Controller', () => {
  let controller: EmailDeliveryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailDeliveryController],
    }).compile();

    controller = module.get<EmailDeliveryController>(EmailDeliveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
