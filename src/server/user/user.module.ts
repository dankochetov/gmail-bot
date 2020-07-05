import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';

import UserController from './user.controller';
import User from './user.entity';
import UserRepository from './user.repository';
import { GoogleModule } from '@/server/google/google.module';
import { AuthModule } from '@/server/auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserRepository]),
        forwardRef(() => GoogleModule),
        forwardRef(() => AuthModule),
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [TypeOrmModule],
})
export class UserModule {}
