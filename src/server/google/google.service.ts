import { Inject, Injectable } from '@nestjs/common';
import { gmail_v1, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

import { EnvService } from '@/server/env/env.service';
import UserRepository from '../user/user.repository';
import User from '@/server/user/user.entity';

@Injectable()
export class GoogleService {
    @Inject()
    userRepository!: UserRepository;

    getOAuth2UserClient({
        tokens,
    }: {
        tokens: NonNullable<User['google_tokens']>;
    }): OAuth2Client {
        const auth = this.getOAuth2Client();
        auth.setCredentials({
            access_token: tokens.access,
            refresh_token: tokens.refresh,
            expiry_date: tokens.expiry_date,
        });
        return auth;
    }

    getGmailClient({
        tokens,
    }: {
        tokens: NonNullable<User['google_tokens']>;
    }): gmail_v1.Gmail {
        return google.gmail({
            version: 'v1',
            auth: this.getOAuth2UserClient({ tokens }),
        });
    }

    getOAuth2Client(): OAuth2Client {
        return new OAuth2Client({
            clientId: EnvService.getEnvVar('GOOGLE_CLIENT_ID'),
            clientSecret: EnvService.getEnvVar('GOOGLE_CLIENT_SECRET'),
            redirectUri: 'postmessage',
        });
    }
}
