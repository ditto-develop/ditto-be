import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository, CHAT_REPOSITORY_TOKEN } from '@module/chat/infrastructure/repository/chat.repository.interface';
import { GroupVoteDto } from '@module/chat/application/dto/vote.dto';
import { toGroupVoteDto } from './create-vote.usecase';
import { ForbiddenException } from '@common/exceptions/application.exception';
import { EntityNotFoundException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetVoteDetailUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  async execute(currentUserId: string, roomId: string, voteId: string): Promise<GroupVoteDto> {
    this.logger.log('투표 상세 조회', 'GetVoteDetailUseCase', { currentUserId, roomId, voteId });

    const isParticipant = await this.chatRepo.isParticipant(roomId, currentUserId);
    if (!isParticipant) {
      throw new ForbiddenException('채팅방 참여자만 투표를 조회할 수 있습니다.');
    }

    const [vote, totalMembers] = await Promise.all([
      this.chatRepo.findVoteById(voteId),
      this.chatRepo.countRoomParticipants(roomId),
    ]);

    if (!vote || vote.roomId !== roomId) {
      throw new EntityNotFoundException('투표', voteId);
    }

    return toGroupVoteDto(vote, currentUserId, totalMembers);
  }
}
