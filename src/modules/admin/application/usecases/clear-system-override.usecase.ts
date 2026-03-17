import { Injectable } from '@nestjs/common';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';

@Injectable()
export class ClearSystemOverrideUseCase {
  constructor(private readonly systemStateService: SystemStateService) {}

  async execute(): Promise<void> {
    await this.systemStateService.setOverrideActive(false);
  }
}
