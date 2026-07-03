import { runMigrations } from '@vendure/core';
import { config } from './vendure-config';

runMigrations(config)
    .then(() => {
        console.log('Migrations complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Migrations failed!', err);
        process.exit(1);
    });
