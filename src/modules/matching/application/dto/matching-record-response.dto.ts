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

export class MatchingRecordWithUserDto {
  @ApiProperty({
    description: '매칭 기록 ID',
    example: 'matching-record-id-123',
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
    description: '매칭 성사 여부',
    example: true,
  })
  isMatched: boolean;

  @ApiProperty({
    description: '매칭 선택 시간',
    example: '2025-02-04T10:00:00.000Z',
  })
  matchedAt: Date;
}