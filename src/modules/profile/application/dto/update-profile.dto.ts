import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsInt, Min, Max, ValidateIf } from 'class-validator';
import { INTRODUCTION_MAX_LENGTH, PREFERRED_AGE_MIN, PREFERRED_AGE_MAX } from '@module/profile/domain/entities/user-profile.entity';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
    @ApiPropertyOptional({
        description: `자기소개 (최대 ${INTRODUCTION_MAX_LENGTH}자, null 전송 시 삭제)`,
        example: '안녕하세요! 대화를 좋아하는 사람입니다.',
        maxLength: INTRODUCTION_MAX_LENGTH,
    })
    @IsOptional()
    @ValidateIf((o) => o.introduction !== null)
    @IsString({ message: '자기소개는 문자열이어야 합니다.' })
    @MaxLength(INTRODUCTION_MAX_LENGTH, {
        message: `자기소개는 최대 ${INTRODUCTION_MAX_LENGTH}자까지 입력할 수 있습니다.`,
    })
    introduction?: string | null;

    @ApiPropertyOptional({
        description: `선호 최소 나이 (${PREFERRED_AGE_MIN}~${PREFERRED_AGE_MAX}, null 전송 시 삭제)`,
        example: 20,
    })
    @IsOptional()
    @ValidateIf((o) => o.preferredMinAge !== null)
    @Type(() => Number)
    @IsInt({ message: '선호 최소 나이는 정수여야 합니다.' })
    @Min(PREFERRED_AGE_MIN, { message: `선호 최소 나이는 ${PREFERRED_AGE_MIN}세 이상이어야 합니다.` })
    @Max(PREFERRED_AGE_MAX, { message: `선호 최소 나이는 ${PREFERRED_AGE_MAX}세 이하여야 합니다.` })
    preferredMinAge?: number | null;

    @ApiPropertyOptional({
        description: `선호 최대 나이 (${PREFERRED_AGE_MIN}~${PREFERRED_AGE_MAX}, null 전송 시 삭제)`,
        example: 30,
    })
    @IsOptional()
    @ValidateIf((o) => o.preferredMaxAge !== null)
    @Type(() => Number)
    @IsInt({ message: '선호 최대 나이는 정수여야 합니다.' })
    @Min(PREFERRED_AGE_MIN, { message: `선호 최대 나이는 ${PREFERRED_AGE_MIN}세 이상이어야 합니다.` })
    @Max(PREFERRED_AGE_MAX, { message: `선호 최대 나이는 ${PREFERRED_AGE_MAX}세 이하여야 합니다.` })
    preferredMaxAge?: number | null;
}
