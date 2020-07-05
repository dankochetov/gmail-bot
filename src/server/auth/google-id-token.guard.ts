import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { AuthService } from '@/server/auth/auth.service';
import { GoogleService } from '@/server/google/google.service';
import UserRepository from '../user/user.repository';

@Injectable({ scope: Scope.REQUEST })
export default class GoogleIdTokenGuard implements CanActivate {
    @Inject(REQUEST)
    req!: Request;

    @Inject()
    authService!: AuthService;

    @Inject()
    googleService!: GoogleService;

    @Inject()
    userRepository!: UserRepository;

    async canActivate(ignoredContext: ExecutionContext): Promise<boolean> {
        if (!this.req.headers.authorization) {
            return false;
        }

        const oauthClient = this.googleService.getOAuth2Client();

        const verifyTokenResponse = await oauthClient.verifyIdToken({
            idToken: this.req.headers.authorization,
        });
        const userId = verifyTokenResponse.getUserId();

        if (!userId) {
            return false;
        }

        const user = await this.userRepository.getById(userId);

        if (!user.google_tokens) {
            return false;
        }

        this.authService.userId = userId;

        const authClient = this.googleService.getOAuth2UserClient({
            tokens: user.google_tokens,
        });
        const {
            credentials: refreshedTokens,
        } = await authClient.refreshAccessToken();

        if (refreshedTokens.access_token !== user.google_tokens.access) {
            this.authService.tokens = {
                access: refreshedTokens.access_token!,
                refresh: refreshedTokens.refresh_token!,
                expiry_date: refreshedTokens.expiry_date!,
            };
            await this.userRepository.saveGoogleTokens({
                id: userId,
                tokens: this.authService.tokens,
                authService: this.authService,
            });
        }

        return true;
    }
}
