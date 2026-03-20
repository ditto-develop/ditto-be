import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { MatchRequest, ScoreBreakdown } from '@module/matching/domain/entities/match-request.entity';

export class SendMatchRequestDto {
    @ApiProperty({ description: '퀴즈셋 ID' })
    @IsString()
    @IsNotEmpty({ message: '퀴즈셋 ID는 필수입니다.' })
    quizSetId: string;

    @ApiProperty({ description: '대상 사용자 ID' })
    @IsString()
    @IsNotEmpty({ message: '대상 사용자 ID는 필수입니다.' })
    toUserId: string;
}

export class MatchRequestDto {
    @ApiProperty() id: string;
    @ApiProperty() quizSetId: string;
    @ApiProperty() fromUserId: string;
    @ApiProperty() toUserId: string;
    @ApiProperty() status: string;
    @ApiProperty() score: number;
    @ApiPropertyOptional() scoreBreakdown: ScoreBreakdown | null;
    @ApiProperty() algorithmVersion: string;
    @ApiProperty() requestedAt: Date;
    @ApiPropertyOptional() respondedAt: Date | null;

    static fromDomain(entity: MatchRequest): MatchRequestDto {
        const dto = new MatchRequestDto();
        dto.id = entity.id;
        dto.quizSetId = entity.quizSetId;
        dto.fromUserId = entity.fromUserId;
        dto.toUserId = entity.toUserId;
        dto.status = entity.status;
        dto.score = entity.score;
        dto.scoreBreakdown = entity.scoreBreakdown;
        dto.algorithmVersion = entity.algorithmVersion;
        dto.requestedAt = entity.requestedAt;
        dto.respondedAt = entity.respondedAt;
        return dto;
    }
}

export class MatchingStatusDto {
    @ApiProperty({ description: '퀴즈셋 ID' }) quizSetId: string;
    @ApiProperty({ description: '이미 매칭 확정 여부' }) hasAcceptedMatch: boolean;
    @ApiPropertyOptional({ description: '매칭 확정된 상대방 userId' }) acceptedMatchUserId?: string;
    @ApiProperty({ description: '보낸 요청', type: [MatchRequestDto] }) sentRequests: MatchRequestDto[];
    @ApiProperty({ description: '받은 요청', type: [MatchRequestDto] }) receivedRequests: MatchRequestDto[];
    @ApiProperty({ description: '그룹 매칭 거절 여부' }) groupDeclined: boolean;
    @ApiProperty({ description: '그룹 매칭 참여 여부 (3명 이상 충족)' }) groupJoined: boolean;
    @ApiProperty({ description: '그룹 참여 신청했으나 3명 미만 대기 중' }) groupJoinPending: boolean;
}
