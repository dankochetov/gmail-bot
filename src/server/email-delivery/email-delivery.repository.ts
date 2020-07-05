import {
    EntityManager,
    EntityRepository,
    getManager,
    Repository,
} from 'typeorm';
import { Inject } from '@nestjs/common';

import User from '@/server/user/user.entity';
import UserRepository from '@/server/user/user.repository';
import EmailDelivery, { Status } from './email-delivery.entity';

@EntityRepository(EmailDelivery)
export default class EmailDeliveryRepository extends Repository<EmailDelivery> {
    @Inject()
    userRepository!: UserRepository;

    async getLatestForUser({
        userId,
    }: {
        userId: User['id'];
    }): Promise<EmailDelivery | undefined> {
        return this.findOne({
            where: {
                created_by: userId,
            },
            order: {
                created_at: 'DESC',
            },
        });
    }

    async getById(
        id: EmailDelivery['id'],
        { manager }: { manager?: EntityManager },
    ): Promise<EmailDelivery> {
        return (manager ?? getManager()).findOneOrFail(EmailDelivery, id);
    }

    async getAllInProgress({
        manager,
    }: {
        manager?: EntityManager;
    } = {}): Promise<EmailDelivery[]> {
        return (manager ?? getManager()).find(EmailDelivery, {
            where: { status: Status.IN_PROGRESS },
        });
    }
}
