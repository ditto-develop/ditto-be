import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { ApiUidProperty } from '../../../../common/decorators/api-uid.decorator';

export class AnswerItem {
  @ApiProperty({ description: '선택지의 순서번호' })
  @IsInt()
  @Min(0)
  @Max(1)
  selectedIndex: number;
}

export class SubmitAnswerDto extends AnswerItem {
  @ApiUidProperty('사용자 고유 ID')
  userId: string;

  @ApiUidProperty('게임 고유 ID')
  gameId: string;
}
