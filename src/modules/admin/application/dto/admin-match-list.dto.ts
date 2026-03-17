import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MatchRequestStatus, MatchingType } from '@prisma/client';

export class AdminMatchListQueryDto {
  @ApiPropertyOptional({ description: '페이지 번호 (1부터)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지당 항목 수', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({ enum: MatchRequestStatus, description: '매칭 상태 필터' })
  @IsOptional()
  @IsEnum(MatchRequestStatus)
  status?: MatchRequestStatus;

  @ApiPropertyOptional({ description: '퀴즈셋 ID 필터' })
  @IsOptional()
  @IsString()
  quizSetId?: string;

  @ApiPropertyOptional({ enum: MatchingType, description: '매칭 유형 필터 (ONE_TO_ONE | GROUP)' })
  @IsOptional()
  @IsEnum(MatchingType)
  matchingType?: MatchingType;
}

export class AdminMatchRequestDto {
  @ApiProperty() id: string;
  @ApiProperty() quizSetId: string;
  @ApiProperty() fromUserId: string;
  @ApiProperty() fromUserNickname: string;
  @ApiProperty() toUserId: string;
  @ApiProperty() toUserNickname: string;
  @ApiProperty({ enum: MatchRequestStatus }) status: MatchRequestStatus;
  @ApiProperty() score: number;
  @ApiPropertyOptional() scoreBreakdown: object | null;
  @ApiProperty() algorithmVersion: string;
  @ApiProperty({ enum: MatchingType }) matchingType: MatchingType;
  @ApiProperty() requestedAt: Date;
  @ApiPropertyOptional() respondedAt: Date | null;
  @ApiProperty() createdAt: Date;
}

export class AdminMatchListResponseDto {
  @ApiProperty({ type: [AdminMatchRequestDto] }) data: AdminMatchRequestDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}
