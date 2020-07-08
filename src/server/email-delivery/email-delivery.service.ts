import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import MailComposer from 'nodemailer/lib/mail-composer';
import { Not, Repository } from 'typeorm';

import EmailDeliveryRepository from './email-delivery.repository';
import EmailDelivery, { Status } from './email-delivery.entity';
import { GoogleService } from '@/server/google/google.service';
import User from '@/server/user/user.entity';
import UserRepository from '@/server/user/user.repository';
import { AuthService } from '@/server/auth/auth.service';
import EmailDeliveryRecipient from '@/server/email-delivery-recipient/email-delivery-recipient.entity';
import { serializableTransactionWithRetry } from '@/server/utils/db';

@Injectable()
export class EmailDeliveryService implements OnApplicationBootstrap {
    @Inject()
    googleService!: GoogleService;

    @Inject()
    emailDeliveryRepository!: EmailDeliveryRepository;

    @Inject()
    userRepository!: UserRepository;

    @InjectRepository(EmailDeliveryRecipient)
    emailDeliveryRecipientRepository!: Repository<EmailDeliveryRecipient>;

    private deliveryIntervalMap: {
        [deliveryId: string]: boolean;
    } = {};

    async onApplicationBootstrap() {
        console.log('rescheduling existing deliveries');
        await this.rescheduleExistingDeliveries();
    }

    private async sendScheduledEmail({
        deliveryId,
        tokens,
    }: {
        deliveryId: EmailDelivery['id'];
        tokens: NonNullable<User['google_tokens']>;
    }): Promise<void> {
        await serializableTransactionWithRetry(async (manager) => {
            const delivery = await this.emailDeliveryRepository.getById(
                deliveryId,
                { manager },
            );

            const gmail = this.googleService.getGmailClient({
                tokens,
            });

            const recipientsQuery = manager
                .createQueryBuilder(EmailDeliveryRecipient, 'r')
                .select()
                .where({ email_delivery_id: deliveryId })
                .orderBy('index');

            const recipients = await recipientsQuery.getMany();

            const toIndex = recipients.findIndex((r) => !r.delivered_at);
            if (toIndex !== -1) {
                const recipient = recipients[toIndex];

                const mailBuilder = new MailComposer({
                    from: delivery.sender,
                    to: recipient.email,
                    subject: delivery.subject,
                    text: delivery.content,
                });

                const rawBuffer = await mailBuilder.compile().build();

                await gmail.users.messages.send({
                    userId: 'me',
                    requestBody: {
                        raw: rawBuffer.toString('base64'),
                    },
                });

                await manager.update(
                    EmailDeliveryRecipient,
                    { email: recipient.email },
                    {
                        delivered_at: new Date(),
                    },
                );
            }

            if (toIndex === -1 || toIndex === recipients.length - 1) {
                this.deliveryIntervalMap[deliveryId] = false;

                if (toIndex === recipients.length - 1) {
                    await manager.update(
                        EmailDelivery,
                        { id: deliveryId },
                        { status: Status.COMPLETED },
                    );

                    await manager.delete(EmailDelivery, {
                        created_by: delivery.created_by,
                        id: Not(deliveryId),
                    });
                }

                if (toIndex === -1) {
                    console.error(
                        new Error('Email delivery already completed'),
                    );
                }
            }
        });
    }

    async listAliases({
        authService,
    }: {
        authService: AuthService;
    }): Promise<string[]> {
        const gmail = this.googleService.getGmailClient({
            tokens: authService.tokens,
        });
        const response = await gmail.users.settings.sendAs.list({
            userId: 'me',
        });
        return (
            response.data.sendAs
                ?.map((alias) => {
                    if (alias.displayName && alias.sendAsEmail) {
                        return `${alias.displayName} <${alias.sendAsEmail}>`;
                    }
                    return alias.sendAsEmail ?? '';
                })
                .filter((s) => !!s) ?? []
        );
    }

    async scheduleDelivery({
        deliveryId,
        tokens,
    }: {
        deliveryId: EmailDelivery['id'];
        tokens: NonNullable<User['google_tokens']>;
    }): Promise<void> {
        if (this.deliveryIntervalMap[deliveryId]) {
            throw new Error(`Delivery ${deliveryId} is already scheduled`);
        }

        const delivery = await this.emailDeliveryRepository.getById(deliveryId);

        this.deliveryIntervalMap[deliveryId] = true;

        (function onTimeout(self) {
            (async () => {
                await self.sendScheduledEmail({ deliveryId, tokens });

                if (self.deliveryIntervalMap[deliveryId]) {
                    setTimeout(
                        () => onTimeout(self),
                        Math.random() *
                            (delivery.delivery_interval_to * 1000 * 60 -
                                delivery.delivery_interval_from * 1000 * 60) +
                            delivery.delivery_interval_from * 1000 * 60,
                    );
                }
            })().catch((e) => {
                console.error(e);
            });
        })(this);
    }

    async rescheduleExistingDeliveries() {
        const deliveries = await this.emailDeliveryRepository.getAllInProgress();
        await Promise.all(
            deliveries.map(async (d) => {
                const user = await d.created_by_user;
                if (!user.google_tokens) {
                    console.error(
                        new Error(
                            `google_tokens field is not set for user ${user.id}`,
                        ),
                    );
                    return;
                }
                await this.scheduleDelivery({
                    deliveryId: d.id,
                    tokens: user.google_tokens,
                });
            }),
        );
    }

    async createOne({
        userId,
        sender,
        recipients,
        subject,
        text,
        authService,
        deliveryInterval,
    }: {
        userId: User['id'];
        sender: string;
        recipients: string[];
        subject: string;
        text: string;
        authService: AuthService;
        deliveryInterval: {
            from: number;
            to: number;
        };
    }) {
        const latestDelivery = await this.emailDeliveryRepository.getLatestForUser(
            { userId },
        );
        if (latestDelivery && latestDelivery.status === Status.IN_PROGRESS) {
            throw new Error('Another email delivery is currently in progress');
        }

        const delivery = this.emailDeliveryRepository.create({
            created_by: userId,
            sender,
            subject,
            content: text,
            delivery_interval_from: deliveryInterval.from,
            delivery_interval_to: deliveryInterval.to,
        });

        await this.emailDeliveryRepository.save(delivery);

        const recipientEntities = recipients.map((email, i) =>
            this.emailDeliveryRecipientRepository.create({
                email,
                index: i,
                email_delivery_id: delivery.id,
            }),
        );

        await this.emailDeliveryRecipientRepository.save(recipientEntities);

        await this.scheduleDelivery({
            deliveryId: delivery.id,
            tokens: authService.tokens,
        });

        return delivery;
    }
}
