import { RedisService } from '@module/common/redis/redis.service';
import { SystemPeriod } from '@module/quiz/domain/value-objects/system-period.vo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemStateService {
  private readonly SYSTEM_PERIOD_KEY = 'system:period';
  private readonly CURRENT_YEAR_KEY = 'system:current_year';
  private readonly CURRENT_MONTH_KEY = 'system:current_month';
  private readonly CURRENT_WEEK_KEY = 'system:current_week';

  constructor(private readonly redisService: RedisService) {}

  /**
   * 현재 시스템 기간 상태를 조회합니다.
   */
  async getCurrentPeriod(): Promise<SystemPeriod> {
    const period = await this.redisService.get(this.SYSTEM_PERIOD_KEY);
    return (period as SystemPeriod) || SystemPeriod.QUIZ;
  }

  /**
   * 시스템 기간 상태를 설정합니다.
   */
  async setCurrentPeriod(period: SystemPeriod): Promise<void> {
    await this.redisService.set(this.SYSTEM_PERIOD_KEY, period);
  }

  /**
   * 현재 년도를 조회합니다.
   */
  async getCurrentYear(): Promise<number> {
    const year = await this.redisService.get(this.CURRENT_YEAR_KEY);
    return year ? parseInt(year, 10) : new Date().getFullYear();
  }

  /**
   * 현재 년도를 설정합니다.
   */
  async setCurrentYear(year: number): Promise<void> {
    await this.redisService.set(this.CURRENT_YEAR_KEY, year.toString());
  }

  /**
   * 현재 월을 조회합니다.
   */
  async getCurrentMonth(): Promise<number> {
    const month = await this.redisService.get(this.CURRENT_MONTH_KEY);
    return month ? parseInt(month, 10) : new Date().getMonth() + 1;
  }

  /**
   * 현재 월을 설정합니다.
   */
  async setCurrentMonth(month: number): Promise<void> {
    await this.redisService.set(this.CURRENT_MONTH_KEY, month.toString());
  }

  /**
   * 현재 주차를 조회합니다.
   */
  async getCurrentWeek(): Promise<number> {
    const week = await this.redisService.get(this.CURRENT_WEEK_KEY);
    return week ? parseInt(week, 10) : 1;
  }

  /**
   * 현재 주차를 설정합니다.
   */
  async setCurrentWeek(week: number): Promise<void> {
    await this.redisService.set(this.CURRENT_WEEK_KEY, week.toString());
  }
}
