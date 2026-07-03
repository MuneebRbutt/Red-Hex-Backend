import path from 'path';
import { VendureConfig } from '@vendure/core';

const IS_DEV = !['prod', 'production'].includes(process.env.APP_ENV ?? 'dev');
const USE_POSTGRES = Boolean(process.env.DATABASE_URL);

export function getDbConnectionOptions(): VendureConfig['dbConnectionOptions'] {
    const migrations = [path.join(__dirname, './migrations/*.+(js|ts)')];

    if (USE_POSTGRES) {
        return {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            synchronize: process.env.DB_SYNCHRONIZE === 'true',
            migrations,
            logging: IS_DEV ? ['error', 'warn'] : ['error'],
            ssl: process.env.DATABASE_SSL === 'false'
                ? false
                : { rejectUnauthorized: false },
        };
    }

    return {
        type: 'better-sqlite3',
        synchronize: false,
        migrations,
        logging: IS_DEV ? ['error', 'warn'] : ['error'],
        database: path.join(__dirname, '../vendure.sqlite'),
        enableWAL: true,
        timeout: 15000,
        prepareDatabase: (db: { pragma: (sql: string) => unknown }) => {
            db.pragma('busy_timeout = 15000');
            db.pragma('synchronous = NORMAL');
        },
    };
}

export function isPostgres(): boolean {
    return USE_POSTGRES;
}

export function isDev(): boolean {
    return IS_DEV;
}
