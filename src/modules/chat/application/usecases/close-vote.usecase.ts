import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository, CHAT_REPOSITORY_TOKEN } from '@module/chat/infrastructure/repository/chat.repository.interface';
import { ForbiddenException } from '@common/exceptions/application.exception';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class CloseVoteUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  async execute(currentUserId: string, roomId: string, voteId: string): Promise<void> {
    this.logger.log('투표 종료', 'CloseVoteUseCase', { currentUserId, roomId, voteId });

    const isParticipant = await this.chatRepo.isParticipant(roomId, currentUserId);
    if (!isParticipant) {
      throw new ForbiddenException('채팅방 참여자만 투표를 종료할 수 있습니다.');
    }

    const vote = await this.chatRepo.findVoteById(voteId);
    if (!vote || vote.roomId !== roomId) {
      throw new EntityNotFoundException('투표', voteId);
    }

    if (vote.status === 'CLOSED') {
      throw new BusinessRuleException('이미 종료된 투표입니다.');
    }

    if (vote.createdByUserId !== currentUserId) {
      throw new ForbiddenException('투표를 생성한 사람만 종료할 수 있습니다.');
    }

    await this.chatRepo.closeVote(voteId);
  }
}
