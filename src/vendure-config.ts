import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSchedulerPlugin,
    DefaultSearchPlugin,
    VendureConfig,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import 'dotenv/config';
import path from 'path';
import { getDbConnectionOptions, isDev, isPostgres } from './get-db-config';
import { StorefrontCatalogPlugin } from './plugins/storefront-catalog/storefront-catalog.plugin';

const IS_DEV = isDev();
const serverPort = +process.env.PORT! || 3000;

const publicUrl = (process.env.PUBLIC_URL ?? '').replace(/\/$/, '');
const storefrontUrl = (process.env.STOREFRONT_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const assetUrlPrefix =
    process.env.ASSET_URL_PREFIX ??
    (publicUrl ? `${publicUrl}/assets/` : undefined);

const assetUploadDir =
    process.env.ASSET_UPLOAD_DIR ?? path.join(__dirname, '../static/assets');

const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : [storefrontUrl, 'http://localhost:3001'];

export const config: VendureConfig = {
    apiOptions: {
        port: serverPort,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        trustProxy: IS_DEV ? false : 1,
        cors: {
            origin: corsOrigins,
            credentials: true,
        },
        ...(IS_DEV
            ? {
                  adminApiDebug: true,
                  shopApiDebug: true,
              }
            : {}),
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME,
            password: process.env.SUPERADMIN_PASSWORD,
        },
        cookieOptions: {
            secret: process.env.COOKIE_SECRET,
            ...(IS_DEV
                ? {}
                : {
                      secure: true,
                      sameSite: 'lax',
                  }),
        },
    },
    dbConnectionOptions: getDbConnectionOptions(),
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    customFields: {},
    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir,
            assetUrlPrefix: IS_DEV ? undefined : assetUrlPrefix,
        }),
        DefaultSchedulerPlugin.init(),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({
            bufferUpdates: !isPostgres(),
            indexStockStatus: true,
        }),
        EmailPlugin.init(
            IS_DEV
                ? {
                      devMode: true,
                      outputPath: path.join(__dirname, '../static/email/test-emails'),
                      route: 'mailbox',
                      handlers: defaultEmailHandlers,
                      templateLoader: new FileBasedTemplateLoader(
                          path.join(__dirname, '../static/email/templates'),
                      ),
                      globalTemplateVars: {
                          fromAddress:
                              process.env.EMAIL_FROM ??
                              '"RED HEX INDUSTRIES" <noreply@redhex.com>',
                          verifyEmailAddressUrl: `${storefrontUrl}/verify`,
                          passwordResetUrl: `${storefrontUrl}/password-reset`,
                          changeEmailAddressUrl: `${storefrontUrl}/verify-email-address-change`,
                      },
                  }
                : {
                      transport: process.env.SMTP_HOST
                          ? {
                                type: 'smtp',
                                host: process.env.SMTP_HOST,
                                port: +(process.env.SMTP_PORT ?? 587),
                                auth: {
                                    user: process.env.SMTP_USER ?? '',
                                    pass: process.env.SMTP_PASS ?? '',
                                },
                            }
                          : { type: 'none' },
                      handlers: defaultEmailHandlers,
                      templateLoader: new FileBasedTemplateLoader(
                          path.join(__dirname, '../static/email/templates'),
                      ),
                      globalTemplateVars: {
                          fromAddress:
                              process.env.EMAIL_FROM ??
                              '"RED HEX INDUSTRIES" <noreply@redhex.com>',
                          verifyEmailAddressUrl: `${storefrontUrl}/verify`,
                          passwordResetUrl: `${storefrontUrl}/password-reset`,
                          changeEmailAddressUrl: `${storefrontUrl}/verify-email-address-change`,
                      },
                  },
        ),
        StorefrontCatalogPlugin,
    ],
};
