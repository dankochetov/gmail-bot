import { EntityRepository, Repository } from 'typeorm';

import User from './user.entity';
import { AuthService } from '../auth/auth.service';

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
    async saveGoogleTokens({
        id,
        tokens,
        authService,
    }: {
        id: User['id'];
        tokens: NonNullable<User['google_tokens']>;
        authService: AuthService;
    }): Promise<void> {
        const fields: Pick<User, keyof User> = {
            id,
            google_tokens: tokens,
            deliveries: Promise.resolve([]),
        };
        await this.save(fields);

        authService.tokens = tokens;
    }

    async getById(id: User['id']): Promise<User> {
        return this.findOneOrFail(id);
    }
}
