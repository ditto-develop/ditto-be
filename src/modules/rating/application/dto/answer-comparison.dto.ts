import { ApiProperty } from '@nestjs/swagger';

export class AnswerComparisonItemDto {
    @ApiProperty({ description: '퀴즈 ID' }) quizId: string;
    @ApiProperty({ description: '퀴즈 질문' }) question: string;
    @ApiProperty({ description: '내 선택 답변' }) myChoice: string | null;
    @ApiProperty({ description: '상대 선택 답변' }) theirChoice: string | null;
    @ApiProperty({ description: '일치 여부' }) isMatch: boolean;
}

export class UserAnswersComparisonDto {
    @ApiProperty({ description: '대상 사용자 ID' }) targetUserId: string;
    @ApiProperty({ description: '퀴즈셋 ID' }) quizSetId: string;
    @ApiProperty({ description: '일치율 (0~100)' }) matchRate: number;
    @ApiProperty({ description: '일치 문제 수' }) matchedCount: number;
    @ApiProperty({ description: '전체 비교 문제 수' }) totalCount: number;
    @ApiProperty({ description: '답변 비교 상세', type: [AnswerComparisonItemDto] })
    comparisons: AnswerComparisonItemDto[];
}
