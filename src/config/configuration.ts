export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'your-access-secret-change-in-production',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret-change-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '14d',
  },
  cookie: {
    domain: {
      development: process.env.COOKIE_DOMAIN_DEV || 'localhost',
      production: process.env.COOKIE_DOMAIN_PROD || 'ditto.pics',
    },
    sameSite: {
      development: 'none',
      production: 'lax',
    },
    secure: {
      development: false,
      production: true,
    },
    httpOnly: true,
    path: '/',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '16379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB ?? '0', 10),
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your-secret-key-change-in-production',
  },
});
