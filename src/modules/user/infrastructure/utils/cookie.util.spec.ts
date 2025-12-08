import { buildRefreshCookieClearOptions, buildRefreshCookieOptions } from './cookie.util';

class MockConfigService {
  constructor(private readonly values: Record<string, any>) {}

  get<T = any>(key: string): T | undefined {
    return this.values[key];
  }
}

describe('cookie util', () => {
  it('returns development options with SameSite=None and secure=false', () => {
    const config = new MockConfigService({
      nodeEnv: 'development',
      'cookie.domain.development': 'localhost',
      'cookie.path': '/',
    });

    const options = buildRefreshCookieOptions(config as any);
    expect(options.sameSite).toBe('none');
    expect(options.secure).toBe(false);
    expect(options.domain).toBe('localhost');
    expect(options.httpOnly).toBe(true);
    expect(options.path).toBe('/');
    expect(options.maxAge).toBe(14 * 24 * 60 * 60 * 1000);
  });

  it('returns production options with SameSite=Lax and secure=true', () => {
    const config = new MockConfigService({
      nodeEnv: 'production',
      'cookie.domain.production': 'ditto.pics',
      'cookie.path': '/',
    });

    const options = buildRefreshCookieOptions(config as any);
    expect(options.sameSite).toBe('lax');
    expect(options.secure).toBe(true);
    expect(options.domain).toBe('ditto.pics');
    expect(options.httpOnly).toBe(true);
  });

  it('clear options sets maxAge to 0', () => {
    const config = new MockConfigService({ nodeEnv: 'production', 'cookie.domain.production': 'ditto.pics' });
    const options = buildRefreshCookieClearOptions(config as any);
    expect(options.maxAge).toBe(0);
  });
});
