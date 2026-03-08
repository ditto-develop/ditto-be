import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScoreBreakdownDto {
    @ApiProperty({ description: '퀴즈 일치율 (0~100)', example: 75 })
    quizMatchRate: number;

    @ApiProperty({ description: '일치한 퀴즈 수', example: 3 })
    matchedQuestions: number;

    @ApiProperty({ description: '전체 비교 퀴즈 수', example: 4 })
    totalQuestions: number;

    @ApiProperty({ description: '설명 목록', example: ['공통 퀴즈 4문제 중 3문제 일치 (75%)'] })
    reasons: string[];
}

export class MatchCandidateDto {
    @ApiProperty({ description: '사용자 ID' })
    userId: string;

    @ApiProperty({ description: '닉네임' })
    nickname: string;

    @ApiProperty({ description: '성별' })
    gender: string;

    @ApiProperty({ description: '나이' })
    age: number;

    @ApiPropertyOptional({ description: '자기소개' })
    introduction: string | null;

    @ApiProperty({ description: '매칭 점수 (0~100)', example: 75 })
    matchRate: number;

    @ApiProperty({ description: '스코어 상세' })
    scoreBreakdown: ScoreBreakdownDto;
}

export class MatchCandidateListDto {
    @ApiProperty({ description: '퀴즈셋 ID' })
    quizSetId: string;

    @ApiProperty({ description: '알고리즘 버전', example: 'v1' })
    algorithmVersion: string;

    @ApiProperty({ description: '후보 목록', type: [MatchCandidateDto] })
    candidates: MatchCandidateDto[];
}
