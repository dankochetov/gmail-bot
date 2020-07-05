import { forwardRef, Module } from '@nestjs/common';

import { GoogleService } from './google.service';
import { UserModule } from '@/server/user/user.module';

@Module({
    imports: [forwardRef(() => UserModule)],
    providers: [GoogleService],
    exports: [GoogleService],
})
export class GoogleModule {}
