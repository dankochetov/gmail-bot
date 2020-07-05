import { Body, Controller, Inject, Post } from '@nestjs/common';

import { AuthService } from '@/server/auth/auth.service';
import UserRepository from './user.repository';
import { UserService } from './user.service';

@Controller('user')
export default class UserController {
    @Inject()
    userRepository!: UserRepository;

    @Inject()
    userService!: UserService;

    @Inject()
    authService!: AuthService;

    @Post('grant-offline-access')
    async grantOfflineAccess(
        @Body() { code }: { code: string },
    ): Promise<{ idToken: string }> {
        const idToken = await this.userService.grantOfflineAccess({
            authService: this.authService,
            code,
        });

        return {
            idToken,
        };
    }
}
