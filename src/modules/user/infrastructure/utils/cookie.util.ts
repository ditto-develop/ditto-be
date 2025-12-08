import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

export function buildRefreshCookieOptions(configService: ConfigService): CookieOptions {
  const env = configService.get<string>('nodeEnv') || 'development';
  const isDevelopment = env === 'development';

  const domain = isDevelopment
    ? configService.get<string>('cookie.domain.development')
    : configService.get<string>('cookie.domain.production');

  const sameSite = isDevelopment ? ('none' as const) : ('lax' as const);
  const secure = isDevelopment ? false : true;

  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  const options: CookieOptions = {
    httpOnly: true,
    path: configService.get<string>('cookie.path') || '/',
    domain: domain || undefined,
    sameSite,
    secure,
    maxAge: fourteenDaysMs,
  };

  return options;
}

export function buildRefreshCookieClearOptions(configService: ConfigService): CookieOptions {
  const options = buildRefreshCookieOptions(configService);
  return { ...options, maxAge: 0 };
}
