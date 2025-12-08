import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(1)
  PORT: number = 4000;

  @IsString()
  JWT_ACCESS_SECRET: string = 'your-access-secret-change-in-production';

  @IsString()
  JWT_REFRESH_SECRET: string = 'your-refresh-secret-change-in-production';

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string = '15m';

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = '14d';

  @IsString()
  COOKIE_DOMAIN_DEV: string = 'localhost';

  @IsString()
  COOKIE_DOMAIN_PROD: string = 'ditto.pics';

  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  REDIS_PORT: number = 6379;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsNumber()
  REDIS_DB: number = 0;

  @IsString()
  DATABASE_URL: string = '';

  @IsString()
  ENCRYPTION_KEY: string = 'your-encryption-key-change-in-production';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessage = errors.map((error) => Object.values(error.constraints || {}).join(',')).join('; ');
    throw new Error(`환경 변수 검증 실패: ${errorMessage}`);
  }

  return validatedConfig;
}
