import { NestFactory } from '@nestjs/core';
import express from 'express';
import path from 'path';

import { AppModule } from './app.module';
import { EnvService } from '@/server/env/env.service';
import NotFoundExceptionFilter from '@/server/NotFoundExceptionFilter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.use(express.static(path.resolve('dist', 'ui')));
    app.useGlobalFilters(new NotFoundExceptionFilter());

    await app.listen(EnvService.getEnvVar('PORT', '3000'));

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => {
            app.close().catch((e) => console.error(e));
        });
    }
}
bootstrap().catch((e) => {
    console.error(e);
    process.exit(1);
});
