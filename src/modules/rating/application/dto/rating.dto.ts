import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import {
    RATING_MIN_SCORE,
    RATING_MAX_SCORE,
    RATING_COMMENT_MAX_LENGTH,
    UserRating,
} from '@module/rating/domain/entities/user-rating.entity';

export class CreateRatingDto {
    @ApiProperty({ description: '매칭 요청 ID' })
    @IsString()
    matchRequestId: string;

    @ApiProperty({ description: `평가 점수 (${RATING_MIN_SCORE}~${RATING_MAX_SCORE})`, example: 4 })
    @IsInt({ message: '평가 점수는 정수여야 합니다.' })
    @Min(RATING_MIN_SCORE, { message: `최소 ${RATING_MIN_SCORE}점입니다.` })
    @Max(RATING_MAX_SCORE, { message: `최대 ${RATING_MAX_SCORE}점입니다.` })
    score: number;

    @ApiPropertyOptional({ description: `코멘트 (최대 ${RATING_COMMENT_MAX_LENGTH}자)`, example: '좋은 대화였습니다!' })
    @IsOptional()
    @IsString()
    @MaxLength(RATING_COMMENT_MAX_LENGTH)
    comment?: string;
}

export class RatingItemDto {
    @ApiProperty() id: string;
    @ApiProperty() score: number;
    @ApiPropertyOptional() comment: string | null;
    @ApiProperty() createdAt: Date;

    static fromDomain(rating: UserRating): RatingItemDto {
        const dto = new RatingItemDto();
        dto.id = rating.id;
        dto.score = rating.score;
        dto.comment = rating.comment;
        dto.createdAt = rating.createdAt;
        return dto;
    }
}

export class UserRatingSummaryDto {
    @ApiProperty({ description: '대상 사용자 ID' }) userId: string;
    @ApiProperty({ description: '총 평가 수' }) totalCount: number;
    @ApiProperty({ description: '평균 점수 (공개 시)' }) averageScore: number | null;
    @ApiProperty({ description: '공개 여부' }) isPublic: boolean;
    @ApiProperty({ description: '공개 기준 수' }) publicThreshold: number;
    @ApiPropertyOptional({ description: '개별 평가 목록 (공개 시에만)', type: [RatingItemDto] })
    ratings: RatingItemDto[] | null;
}
