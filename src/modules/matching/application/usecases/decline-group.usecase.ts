import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '@module/user/infrastructure/repository/user.repository.interface';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';

@Injectable()
export class DeclineGroupUseCase {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) {}

    async execute(userId: string): Promise<void> {
        this.logger.log('그룹 참여 거절 요청', 'DeclineGroupUseCase', { userId });

        const me = await this.userRepo.findById(userId);
        if (!me || !me.isActive()) {
            throw new EntityNotFoundException('활성 사용자', userId);
        }

        const myProgress = await this.prisma.userQuizProgress.findFirst({
            where: { userId, status: 'COMPLETED' },
            orderBy: { completedAt: 'desc' },
            include: { quizSet: { select: { matchingType: true } } },
        });

        if (!myProgress) {
            throw new EntityNotFoundException('완료된 퀴즈 참여 기록', userId);
        }

        if (myProgress.quizSet.matchingType !== 'GROUP') {
            throw new BusinessRuleException('그룹 매칭 타입의 퀴즈셋이 아닙니다.');
        }

        await this.prisma.userQuizProgress.update({
            where: { id: myProgress.id },
            data: { groupDeclined: true },
        });

        this.logger.log('그룹 참여 거절 완료', 'DeclineGroupUseCase', { userId, progressId: myProgress.id });
    }
}
