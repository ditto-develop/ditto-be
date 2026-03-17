import { Injectable } from '@nestjs/common';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import { SystemPeriod } from '@module/quiz/domain/value-objects/system-period.vo';

@Injectable()
export class SetSystemOverrideUseCase {
  constructor(private readonly systemStateService: SystemStateService) {}

  async execute(period: SystemPeriod): Promise<void> {
    await this.systemStateService.setCurrentPeriod(period);
    await this.systemStateService.setOverrideActive(true);
  }
}
