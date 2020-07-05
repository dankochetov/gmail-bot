import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { EnvService } from '@/server/env/env.service';

interface Class {
    new (...args: unknown[]): unknown;
}

import RequireContext = __WebpackModuleApi.RequireContext;

let requireMigration: RequireContext | undefined;
try {
    requireMigration = require.context(
        './src/server/migrations',
        false,
        /\.ts$/,
    );
} catch (ignoredError) {
    // If folder doesn't exist, do nothing
}

const migrations: Class[] = [];
if (requireMigration) {
    // Persisting requireEntity value with IIFE closure, so requireEntity can be shadowed
    // eslint-disable-next-line no-shadow
    ((requireMigration) => {
        requireMigration.keys().forEach((key) => {
            migrations.push(
                Object.values(
                    requireMigration(key) as { [className: string]: Class },
                )[0],
            );
        });
    })(requireMigration);
}

const config: PostgresConnectionOptions = {
    type: 'postgres',
    url: EnvService.getEnvVar('DB_URL'),
    cli: {
        migrationsDir: 'src/server/migrations',
    },
    migrations,
    migrationsRun: true,
    logging: false,
};

export = config;
