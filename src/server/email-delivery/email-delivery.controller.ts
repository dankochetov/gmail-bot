import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';

import { DeliveryResponse } from '@/ui/components/TabsRoot';
import { AuthService } from '@/server/auth/auth.service';
import GoogleIdTokenGuard from '@/server/auth/google-id-token.guard';
import { EmailDeliveryService } from './email-delivery.service';
import EmailDeliveryRepository from './email-delivery.repository';

@Controller('email-delivery')
export class EmailDeliveryController {
    @Inject()
    emailDeliveryService!: EmailDeliveryService;

    @Inject()
    authService!: AuthService;

    @Inject()
    emailDeliveryRepository!: EmailDeliveryRepository;

    @Get('aliases')
    @UseGuards(GoogleIdTokenGuard)
    async listAliases(): Promise<string[]> {
        return this.emailDeliveryService.listAliases({
            authService: this.authService,
        });
    }

    @Post()
    @UseGuards(GoogleIdTokenGuard)
    async create(
        @Body()
        {
            from,
            to,
            subject,
            text,
            deliveryInterval,
        }: {
            from: string;
            to: string[];
            subject: string;
            text: string;
            deliveryInterval: {
                from: number;
                to: number;
            };
        },
    ): Promise<DeliveryResponse> {
        const delivery = await this.emailDeliveryService.createOne({
            userId: this.authService.userId,
            sender: from,
            recipients: to,
            subject,
            text,
            deliveryInterval,
            authService: this.authService,
        });

        return {
            delivery: {
                ...delivery,
                recipients: await delivery.recipients,
            },
        };
    }

    @Get('latest')
    @UseGuards(GoogleIdTokenGuard)
    async getLatest(): Promise<DeliveryResponse> {
        const delivery = await this.emailDeliveryRepository.getLatestForUser({
            userId: this.authService.userId,
        });

        return {
            delivery: delivery
                ? {
                      ...delivery,
                      recipients: await delivery.recipients,
                  }
                : null,
        };
    }
}
