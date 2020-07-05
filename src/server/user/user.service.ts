import { Inject, Injectable } from '@nestjs/common';

import { AuthService } from '@/server/auth/auth.service';
import { GoogleService } from '@/server/google/google.service';
import UserRepository from './user.repository';
import User from './user.entity';

@Injectable()
export class UserService {
    @Inject()
    userRepository!: UserRepository;

    @Inject()
    googleService!: GoogleService;

    async grantOfflineAccess({
        code,
        authService,
    }: {
        code: string;
        authService: AuthService;
    }): Promise<string> {
        const oauthClient = this.googleService.getOAuth2Client();

        const authResponse = await oauthClient.getToken({
            code,
        });

        if (!authResponse.tokens.access_token) {
            throw new Error('access_token is not present in getToken response');
        }

        if (!authResponse.tokens.refresh_token) {
            throw new Error(
                'refresh_token is not present in getToken response',
            );
        }

        if (!authResponse.tokens.id_token) {
            throw new Error(
                'refresh_token is not present in getToken response',
            );
        }

        if (!authResponse.tokens.expiry_date) {
            throw new Error('expiry_date is not present in getToken response');
        }

        const verifyIdTokenResponse = await oauthClient.verifyIdToken({
            idToken: authResponse.tokens.id_token,
        });
        const userId = verifyIdTokenResponse.getUserId();
        if (!userId) {
            throw new Error(`verifyIdToken().getUserId() returned null`);
        }

        const tokens: User['google_tokens'] = {
            access: authResponse.tokens.access_token,
            refresh: authResponse.tokens.refresh_token,
            expiry_date: authResponse.tokens.expiry_date,
        };

        await this.userRepository.saveGoogleTokens({
            id: userId,
            tokens,
            authService,
        });

        return authResponse.tokens.id_token;
    }
}
