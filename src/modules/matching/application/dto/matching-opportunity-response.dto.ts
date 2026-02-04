import { ApiProperty } from '@nestjs/swagger';

export class MatchedUserDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 'user-id-123',
  })
  id: string;

  @ApiProperty({
    description: '닉네임',
    example: '매칭상대',
  })
  nickname: string;

  @ApiProperty({
    description: '성별',
    example: 'male',
    enum: ['male', 'female'],
  })
  gender: string;
}

export class MatchingOpportunityWithUserDto {
  @ApiProperty({
    description: '매칭 기회 ID',
    example: 'matching-opportunity-id-123',
  })
  id: string;

  @ApiProperty({
    description: '매칭된 사용자 ID',
    example: 'matched-user-id-456',
  })
  matchedUserId: string;

  @ApiProperty({
    description: '매칭된 사용자 정보',
    type: MatchedUserDto,
  })
  matchedUser: MatchedUserDto;

  @ApiProperty({
    description: '퀴즈 세트 ID',
    example: 'quiz-set-id-789',
  })
  quizSetId: string;

  @ApiProperty({
    description: '매칭 점수 (0-12)',
    example: 8,
    minimum: 0,
    maximum: 12,
  })
  matchScore: number;

  @ApiProperty({
    description: '생성 시간',
    example: '2025-02-04T10:00:00.000Z',
  })
  createdAt: Date;
}