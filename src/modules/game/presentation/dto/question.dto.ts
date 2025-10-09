import { ApiProperty } from '@nestjs/swagger';
import { ApiUidProperty } from '../../../../common/decorators/api-uid.decorator';

export class OptionDto {
  @ApiProperty()
  index: number;

  @ApiProperty()
  label: string;
}

export class QuestionDto {
  @ApiUidProperty('질문 고유 ID')
  id: string;

  @ApiProperty({ description: '밸런스 게임 질문', example: '한 가지 능력을 갖는다면?' })
  text: string;

  @ApiProperty({
    type: [OptionDto],
    description: '선택지',
    example: [
      { index: '0', label: '투명인간' },
      { index: '1', label: '순간이동' },
    ],
  })
  options: OptionDto[];

  @ApiProperty({ description: '게임 라운드', example: 1 })
  round: number;
}
