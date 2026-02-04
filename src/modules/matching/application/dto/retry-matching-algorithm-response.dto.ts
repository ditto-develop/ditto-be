import { ApiProperty } from '@nestjs/swagger';

export class RetryMatchingAlgorithmResponseDto {
  @ApiProperty({
    description: '성공 메시지',
    example: '매칭 알고리즘 재실행이 큐에 추가되었습니다.',
  })
  message: string;

  @ApiProperty({
    description: '퀴즈 세트 ID',
    example: 'quiz-set-id-789',
  })
  quizSetId: string;
}