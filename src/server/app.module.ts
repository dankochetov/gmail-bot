import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import ormconfig from '@/../ormconfig';

import { AuthModule } from '@/server/auth/auth.module';
import { EnvService } from '@/server/env/env.service';
import { GoogleModule } from '@/server/google/google.module';
import ServeUIMiddleware from '@/server/serve-ui.middleware';
import { UserModule } from '@/server/user/user.module';
import { EmailDeliveryModule } from '@/server/email-delivery/email-delivery.module';
import { EmailDeliveryRecipientModule } from './email-delivery-recipient/email-delivery-recipient.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            ...ormconfig,
            autoLoadEntities: true,
        }),
        AuthModule,
        GoogleModule,
        UserModule,
        EmailDeliveryModule,
        EmailDeliveryRecipientModule,
    ],
    providers: [EnvService],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ServeUIMiddleware).forRoutes({
            path: 'ui(/?|/*)',
            method: RequestMethod.GET,
        });
    }
}
