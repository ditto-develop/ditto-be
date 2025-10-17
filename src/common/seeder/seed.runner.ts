import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ISeeder, ISeederToken } from './seeder.interface';

@Injectable()
export class SeedRunner implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedRunner.name);

  constructor(
    @Inject(ISeederToken)
    private readonly seeders: ISeeder[],
  ) {}

  async onApplicationBootstrap() {
    if (!this.seeders || this.seeders.length === 0) {
      this.logger.log('등록된 Seeder가 없습니다.');
    }

    const sorted = [...this.seeders].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const seeder of sorted) {
      const name = seeder.constructor?.name ?? 'UnknownSeeder';
      try {
        this.logger.log(`Seeder 시작: ${name}`);
        await seeder.seed();
        this.logger.log(`Seeder 완료: ${name}`);
      } catch (err: unknown) {
        let errName = 'UnknownError';
        let errMessage = '알 수 없는 에러로 인해 Seeder 실패';
        if (err instanceof Error) {
          errName = err.name;
          errMessage = err.message;
        }
        this.logger.error(`Seeder 실패: ${name}; err: ${errName} - ${errMessage}`);
      }
    }

    this.logger.log(`모든 Seeder 실행 완료`);
  }
}
