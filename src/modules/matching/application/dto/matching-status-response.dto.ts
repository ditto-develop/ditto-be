import { ApiProperty } from '@nestjs/swagger';

export class MatchingStatusResponseDto {
  @ApiProperty({
    description: '매칭 알고리즘 실행 상태',
    example: 'completed',
    enum: ['pending', 'processing', 'completed', 'failed'],
  })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiProperty({
    description: '퀴즈 세트 ID',
    example: 'quiz-set-id-789',
  })
  quizSetId: string;

  @ApiProperty({
    description: '업데이트 시간',
    example: '2025-02-04T10:00:00.000Z',
  })
  updatedAt: Date;
}