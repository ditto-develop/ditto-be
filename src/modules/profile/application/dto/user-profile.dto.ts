import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserProfile } from '@module/profile/domain/entities/user-profile.entity';

export class MatchingPreferencesDto {
    @ApiPropertyOptional({ description: '선호 최소 나이', example: 20 })
    minAge: number | null;

    @ApiPropertyOptional({ description: '선호 최대 나이', example: 30 })
    maxAge: number | null;
}

export class UserProfileDto {
    @ApiProperty({ description: '프로필 ID' })
    id: string;

    @ApiProperty({ description: '사용자 ID' })
    userId: string;

    @ApiPropertyOptional({ description: '자기소개 (최대 300자)', example: '안녕하세요! 대화를 좋아하는 사람입니다.' })
    introduction: string | null;

    @ApiPropertyOptional({ description: '프로필 이미지 URL', example: 'https://example.com/image.jpg' })
    profileImageUrl: string | null;

    @ApiPropertyOptional({ description: '지역', example: '서울' })
    location: string | null;

    @ApiProperty({ description: '매칭 선호 조건' })
    matchingPreferences: MatchingPreferencesDto;

    @ApiProperty({ description: '생성일시' })
    createdAt: Date;

    @ApiProperty({ description: '수정일시' })
    updatedAt: Date;

    static fromDomain(profile: UserProfile): UserProfileDto {
        const dto = new UserProfileDto();
        dto.id = profile.id;
        dto.userId = profile.userId;
        dto.introduction = profile.introduction;
        dto.profileImageUrl = profile.profileImageUrl;
        dto.location = profile.location;
        dto.matchingPreferences = {
            minAge: profile.preferredMinAge,
            maxAge: profile.preferredMaxAge,
        };
        dto.createdAt = profile.createdAt;
        dto.updatedAt = profile.updatedAt;
        return dto;
    }
}
