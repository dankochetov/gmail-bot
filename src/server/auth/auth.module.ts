import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { GoogleModule } from '@/server/google/google.module';
import { UserModule } from '@/server/user/user.module';

@Module({
    imports: [PassportModule, GoogleModule, forwardRef(() => UserModule)],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
