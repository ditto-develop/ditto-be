import { Injectable } from '@nestjs/common';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import { SystemStateDto } from '../dto/system-state.dto';

@Injectable()
export class GetSystemStateUseCase {
  constructor(private readonly systemStateService: SystemStateService) {}

  async execute(): Promise<SystemStateDto> {
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();
    const period = await this.systemStateService.getCurrentPeriod();

    return {
      year,
      month,
      week,
      period,
    };
  }
}
