import fs from 'fs';
import { VendureConfig } from '@vendure/core';
import { config } from './vendure-config';
import { isPostgres } from './get-db-config';

export function getScriptConfig(): VendureConfig {
    return {
        ...config,
        dbConnectionOptions: {
            ...config.dbConnectionOptions,
            synchronize: isPostgres() ? false : shouldSynchronizeSqliteSchema(),
        } as VendureConfig['dbConnectionOptions'],
    };
}

function shouldSynchronizeSqliteSchema(): boolean {
    const dbOptions = config.dbConnectionOptions as any;
    if (dbOptions.type !== 'better-sqlite3' || typeof dbOptions.database !== 'string') {
        return false;
    }

    if (!fs.existsSync(dbOptions.database) || fs.statSync(dbOptions.database).size === 0) {
        return true;
    }

    try {
        const Database = require('better-sqlite3');
        const db = new Database(dbOptions.database, { readonly: true, fileMustExist: true });
        const table = db
            .prepare("select name from sqlite_master where type = 'table' and name = 'administrator'")
            .get();
        db.close();
        return !table;
    } catch {
        return false;
    }
}
