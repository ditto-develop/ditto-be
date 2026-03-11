/**
 * 주차 계산 및 기간 확인 유틸리티
 */
export class WeekCalculator {
  /**
   * UTC Date를 KST Date로 변환합니다. (UTC+9)
   */
  static toKst(date: Date = new Date()): Date {
    return new Date(date.getTime() + 9 * 60 * 60 * 1000);
  }

  /**
   * 해당 월의 첫 번째 월요일을 가져옵니다.
   */
  static getFirstMondayOfMonth(year: number, month: number): Date {
    const firstDay = new Date(year, month - 1, 1);
    const dayOfWeek = firstDay.getDay(); // 0: 일, 1: 월, ..., 6: 토
    // 월요일(1)까지 남은 일수 계산
    const daysUntilMonday = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const firstMonday = new Date(year, month - 1, 1 + daysUntilMonday);
    firstMonday.setHours(0, 0, 0, 0);
    return firstMonday;
  }

  /**
   * 날짜를 기준으로 월별 주차 정보를 계산합니다. (년, 월, 주차)
   * 해당 월의 첫 번째 월요일을 1주차 시작으로 하며, 그 이전은 이전 달의 마지막 주로 취급합니다.
   */
  static calculateYearMonthWeek(date: Date = new Date()): { year: number; month: number; week: number } {
    const kst = this.toKst(date);
    const target = new Date(kst.getTime());
    target.setHours(0, 0, 0, 0);

    let year = target.getFullYear();
    let month = target.getMonth() + 1;

    let firstMonday = this.getFirstMondayOfMonth(year, month);

    // 현재 날짜가 이번 달의 첫 번째 월요일보다 이전이면 이전 달로 이동
    if (target < firstMonday) {
      const prevMonthDate = new Date(year, month - 2, 1);
      year = prevMonthDate.getFullYear();
      month = prevMonthDate.getMonth() + 1;
      firstMonday = this.getFirstMondayOfMonth(year, month);
    }

    const diffDays = Math.floor((target.getTime() - firstMonday.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.floor(diffDays / 7) + 1;

    return { year, month, week };
  }

  /**
   * 현재 주차를 계산합니다. (하위 호환성을 위해 유지하되 내부적으로 calculateYearMonthWeek 사용)
   */
  static calculateCurrentWeek(date: Date = new Date()): number {
    return this.calculateYearMonthWeek(date).week;
  }

  /**
   * 특정 년, 월, 주차의 시작일(월요일)을 가져옵니다.
   */
  static getWeekStartDate(year: number, month: number, week: number): Date {
    const firstMonday = this.getFirstMondayOfMonth(year, month);
    const startDate = new Date(firstMonday.getTime());
    startDate.setDate(firstMonday.getDate() + (week - 1) * 7);
    startDate.setHours(0, 0, 0, 0);
    return startDate;
  }

  /**
   * 특정 년, 월의 모든 주차 정보를 가져옵니다.
   */
  static getWeeksInMonth(year: number, month: number): { week: number; startDate: Date; endDate: Date }[] {
    const weeks: { week: number; startDate: Date; endDate: Date }[] = [];
    const firstMonday = this.getFirstMondayOfMonth(year, month);

    // 다음 달의 첫 번째 월요일을 구하여 루프 종료 조건으로 사용
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonthFirstMonday = this.getFirstMondayOfMonth(nextYear, nextMonth);

    let currentStartDate = new Date(firstMonday.getTime());
    let weekNum = 1;

    while (currentStartDate < nextMonthFirstMonday) {
      const endDate = new Date(currentStartDate.getTime());
      endDate.setDate(currentStartDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      weeks.push({
        week: weekNum,
        startDate: new Date(currentStartDate.getTime()),
        endDate: endDate,
      });

      currentStartDate.setDate(currentStartDate.getDate() + 7);
      weekNum++;
    }

    return weeks;
  }

  /**
   * 현재 요일이 퀴즈 기간(월~수)인지 확인합니다. (KST 기준)
   * (0: 일, 1: 월, 2: 화, 3: 수, 4: 목, 5: 금, 6: 토)
   */
  static isQuizPeriod(date: Date = new Date()): boolean {
    const day = this.toKst(date).getDay();
    return day >= 1 && day <= 3;
  }

  /**
   * 현재 요일이 매칭 기간(목)인지 확인합니다. (KST 기준)
   */
  static isMatchingPeriod(date: Date = new Date()): boolean {
    return this.toKst(date).getDay() === 4;
  }

  /**
   * 현재 요일이 채팅 기간(금~일)인지 확인합니다. (KST 기준)
   */
  static isChattingPeriod(date: Date = new Date()): boolean {
    const day = this.toKst(date).getDay();
    return day === 5 || day === 6 || day === 0;
  }
}
