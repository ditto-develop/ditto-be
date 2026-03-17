import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SystemPeriod } from '@module/quiz/domain/value-objects/system-period.vo';

export class SetSystemOverrideDto {
  @ApiProperty({
    enum: SystemPeriod,
    description: '설정할 시스템 기간',
    example: SystemPeriod.MATCHING,
  })
  @IsEnum(SystemPeriod)
  period: SystemPeriod;
}
