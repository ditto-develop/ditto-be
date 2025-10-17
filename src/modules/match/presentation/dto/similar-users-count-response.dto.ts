import { ApiProperty } from '@nestjs/swagger';

export class SimilarUsersCountResponseDto {
  @ApiProperty({
    description: '전체 사용자 수 (본인 제외)',
    example: 1002,
    type: Number,
  })
  totalCount: number;

  @ApiProperty({
    description: 'x% 일치한 사용자 수 (본인 제외)',
    example: 28,
    type: Number,
  })
  similarCount: number;

  @ApiProperty({
    description: '100% 일치한 사용자 수 (본인 제외)',
    example: 2,
    type: Number,
  })
  sameCount: number;
}
