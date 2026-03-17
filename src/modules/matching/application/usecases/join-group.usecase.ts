import { Inject, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '@module/user/infrastructure/repository/user.repository.interface';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { MATCHING_CONSTANTS } from '@module/matching/domain/value-objects/match-candidate.vo';

export class GroupJoinResultDto {
    @ApiProperty({ description: '그룹 채팅방 ID' })
    roomId: string;

    @ApiProperty({ description: '퀴즈셋 ID' })
    quizSetId: string;

    @ApiProperty({ description: '현재 참여 인원 수' })
    participantCount: number;

    @ApiProperty({ description: '3명 이상 참여 시 true — 채팅 시작 가능 상태' })
    isActive: boolean;
}

@Injectable()
export class JoinGroupUseCase {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) {}

    async execute(userId: string): Promise<GroupJoinResultDto> {
        this.logger.log('그룹 참여 요청', 'JoinGroupUseCase', { userId });

        // 1. 사용자 확인
        const me = await this.userRepo.findById(userId);
        if (!me || !me.isActive()) {
            throw new EntityNotFoundException('활성 사용자', userId);
        }

        // 2. 현재 완료된 GROUP 타입 퀴즈셋 조회
        const myProgress = await this.prisma.userQuizProgress.findFirst({
            where: { userId, status: 'COMPLETED' },
            orderBy: { completedAt: 'desc' },
            include: { quizSet: { select: { id: true, matchingType: true } } },
        });

        if (!myProgress) {
            throw new EntityNotFoundException('완료된 퀴즈 참여 기록', userId);
        }

        if (myProgress.quizSet.matchingType !== 'GROUP') {
            throw new BusinessRuleException('그룹 매칭 타입의 퀴즈셋이 아닙니다.');
        }

        const quizSetId = myProgress.quizSetId;

        // 3. 그룹 채팅방 find-or-create
        let chatRoom = await this.prisma.chatRoom.findUnique({ where: { quizSetId } });
        if (!chatRoom) {
            chatRoom = await this.prisma.chatRoom.create({
                data: { quizSetId },
            });
            this.logger.log('그룹 채팅방 생성', 'JoinGroupUseCase', { roomId: chatRoom.id, quizSetId });
        }

        // 4. 이미 참여 중인지 확인
        const existing = await this.prisma.chatParticipant.findUnique({
            where: { roomId_userId: { roomId: chatRoom.id, userId } },
        });

        if (!existing) {
            await this.prisma.chatParticipant.create({
                data: { roomId: chatRoom.id, userId },
            });
        }

        // 5. 현재 참여 인원 조회
        const participantCount = await this.prisma.chatParticipant.count({
            where: { roomId: chatRoom.id },
        });

        const isActive = participantCount >= MATCHING_CONSTANTS.MIN_GROUP_PARTICIPANTS;
        this.logger.log('그룹 참여 완료', 'JoinGroupUseCase', { roomId: chatRoom.id, participantCount, isActive });

        const result = new GroupJoinResultDto();
        result.roomId = chatRoom.id;
        result.quizSetId = quizSetId;
        result.participantCount = participantCount;
        result.isActive = isActive;
        return result;
    }
}
