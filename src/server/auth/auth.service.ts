import { Injectable, Scope } from '@nestjs/common';

import User from '@/server/user/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
    userId!: User['id'];

    tokens!: NonNullable<User['google_tokens']>;
}
