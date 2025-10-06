import { ApiProperty } from '@nestjs/swagger';

export class SimilarUsersCountResponseDto {
  @ApiProperty({
    description: 'x% 일치한 사용자 수',
    example: 3,
    type: Number,
  })
  count: number;
}
