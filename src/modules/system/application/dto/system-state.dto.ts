import { ApiProperty } from '@nestjs/swagger';
import { SystemPeriod } from '@module/quiz/domain/value-objects/system-period.vo';

export class SystemStateDto {
  @ApiProperty({
    description: '현재 년도',
    example: 2025,
  })
  year: number;

  @ApiProperty({
    description: '현재 월',
    example: 12,
  })
  month: number;

  @ApiProperty({
    description: '현재 주차',
    example: 1,
  })
  week: number;

  @ApiProperty({
    description: '현재 시스템 기간 상태',
    enum: SystemPeriod,
    example: SystemPeriod.QUIZ,
  })
  period: SystemPeriod;
}
