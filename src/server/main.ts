import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);

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
