import { ApiProperty } from '@nestjs/swagger';

export class SimilarUsersCountResponseDto {
  @ApiProperty({
    description: '전체 사용자 수',
    example: 1000,
    type: Number,
  })
  total: number;

  @ApiProperty({
    description: 'x% 일치한 사용자 수',
    example: 3,
    type: Number,
  })
  count: number;
}
