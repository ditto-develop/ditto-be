import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminCreateDummyMatchRequestDto {
  @ApiProperty({ description: '더미 유저 ID (fromUser)' })
  @IsString()
  @IsNotEmpty()
  fromUserId: string;

  @ApiProperty({ description: '실제 유저 ID (toUser)' })
  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @ApiProperty({ description: '퀴즈셋 ID' })
  @IsString()
  @IsNotEmpty()
  quizSetId: string;
}

export class AdminCreateDummyMatchResultDto {
  id: string;
  fromUserNickname: string;
  toUserNickname: string;
  quizSetId: string;
  status: string;
  score: number;
  alreadyExists: boolean;
}

export class AdminActiveQuizSetDto {
  id: string;
  title: string;
  matchingType: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
}
