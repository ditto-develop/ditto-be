import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 공개 프로필 응답 DTO
 * 민감 정보(phone, email 등) 제외, 프로필 + 기본 유저 정보만 포함
 */
export class PublicProfileDto {
    @ApiProperty({ description: '사용자 ID' })
    userId: string;

    @ApiProperty({ description: '닉네임', example: 'ditto_user' })
    nickname: string;

    @ApiProperty({ description: '성별', example: 'MALE' })
    gender: string;

    @ApiProperty({ description: '나이', example: 25 })
    age: number;

    @ApiPropertyOptional({ description: '자기소개', example: '안녕하세요!' })
    introduction: string | null;

    @ApiPropertyOptional({ description: '프로필 이미지 URL', example: 'https://example.com/image.jpg' })
    profileImageUrl: string | null;

    @ApiPropertyOptional({ description: '지역', example: '서울' })
    location: string | null;

    @ApiPropertyOptional({ description: '선호 최소 나이', example: 20 })
    preferredMinAge: number | null;

    @ApiPropertyOptional({ description: '선호 최대 나이', example: 30 })
    preferredMaxAge: number | null;
}
