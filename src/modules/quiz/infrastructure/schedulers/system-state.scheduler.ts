import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SystemStateService } from '../services/system-state.service';
import { WeekCalculator } from '@module/quiz/domain/utils/week-calculator.util';
import { SystemPeriod } from '@module/quiz/domain/value-objects/system-period.vo';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class SystemStateScheduler implements OnModuleInit {
  constructor(
    private readonly systemStateService: SystemStateService,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  /**
   * 앱 시작 시 초기 상태를 설정합니다.
   */
  async onModuleInit() {
    this.logger.log('시스템 상태 초기화 중...', SystemStateScheduler.name);
    await this.updateSystemState();
  }

  /**
   * 매일 KST 자정(UTC 15:00)에 시스템 상태를 업데이트합니다.
   */
  @Cron('0 15 * * *')
  async handleMidnightUpdate() {
    this.logger.log('KST 자정 시스템 상태 업데이트 시작', SystemStateScheduler.name);
    await this.updateSystemState();
  }

  /**
   * 현재 날짜에 맞춰 시스템 상태와 주차를 업데이트합니다.
   */
  private async updateSystemState() {
    const isOverride = await this.systemStateService.isOverrideActive();
    if (isOverride) {
      this.logger.log('시간 오버라이드 활성 중 - 자동 업데이트 스킵', SystemStateScheduler.name);
      return;
    }

    const now = new Date();

    // 1. 년, 월, 주차 업데이트
    const { year, month, week } = WeekCalculator.calculateYearMonthWeek(now);
    await this.systemStateService.setCurrentYear(year);
    await this.systemStateService.setCurrentMonth(month);
    await this.systemStateService.setCurrentWeek(week);
    this.logger.log(`현재 상태 설정됨: ${year}년 ${month}월 ${week}주차`, SystemStateScheduler.name);

    // 2. 기간 상태 업데이트
    let period: SystemPeriod;
    if (WeekCalculator.isQuizPeriod(now)) {
      period = SystemPeriod.QUIZ;
    } else if (WeekCalculator.isMatchingPeriod(now)) {
      period = SystemPeriod.MATCHING;
    } else {
      period = SystemPeriod.CHATTING;
    }

    await this.systemStateService.setCurrentPeriod(period);
    this.logger.log(`현재 시스템 기간 설정됨: ${period}`, SystemStateScheduler.name);
  }
}
