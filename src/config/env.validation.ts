import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, Min, validateSync } from 'class-validator';

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
  JWT_SECRET: string = 'your-secret-key-change-in-production';

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
