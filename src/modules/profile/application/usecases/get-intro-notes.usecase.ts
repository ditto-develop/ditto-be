import { Inject, Injectable } from '@nestjs/common';
import {
    IUserIntroNoteRepository,
    USER_INTRO_NOTE_REPOSITORY_TOKEN,
} from '@module/profile/infrastructure/repository/user-intro-note.repository.interface';
import { IntroNotesDto } from '@module/profile/application/dto/intro-notes.dto';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { BusinessRuleException } from '@common/exceptions/domain.exception';

@Injectable()
export class GetIntroNotesUseCase {
    constructor(
        @Inject(USER_INTRO_NOTE_REPOSITORY_TOKEN)
        private readonly introNoteRepo: IUserIntroNoteRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
        private readonly prisma: PrismaService,
    ) { }

    async execute(userId: string, currentUserId?: string): Promise<IntroNotesDto> {
        this.logger.log('소개 노트 조회', 'Profile:GetIntroNotesUseCase', { userId, currentUserId });

        // 본인 조회이거나 currentUserId 없는 경우 권한 체크 생략
        if (currentUserId && currentUserId !== userId) {
            const isAuthorized = await this.checkAccess(currentUserId, userId);
            if (!isAuthorized) {
                throw new BusinessRuleException('매칭이 성사되었거나 같은 그룹 채팅에 참여한 사용자의 소개 노트만 조회할 수 있습니다.');
            }
        }

        const note = await this.introNoteRepo.findByUserId(userId);
        if (!note) return IntroNotesDto.empty();
        return IntroNotesDto.fromDomain(note);
    }

    private async checkAccess(currentUserId: string, targetUserId: string): Promise<boolean> {
        // 1:1 ACCEPTED 매칭 확인
        const match = await this.prisma.matchRequest.findFirst({
            where: {
                status: 'ACCEPTED',
                OR: [
                    { fromUserId: currentUserId, toUserId: targetUserId },
                    { fromUserId: targetUserId, toUserId: currentUserId },
                ],
            },
        });
        if (match) return true;

        // 그룹 채팅 멤버십 확인
        const sharedGroupRoom = await this.prisma.chatRoom.findFirst({
            where: {
                quizSetId: { not: null },
                AND: [
                    { participants: { some: { userId: currentUserId } } },
                    { participants: { some: { userId: targetUserId } } },
                ],
            },
        });
        return sharedGroupRoom !== null;
    }
}
