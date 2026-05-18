import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository, CHAT_REPOSITORY_TOKEN } from '@module/chat/infrastructure/repository/chat.repository.interface';
import { CastVoteDto, GroupVoteDto } from '@module/chat/application/dto/vote.dto';
import { toGroupVoteDto } from './create-vote.usecase';
import { ForbiddenException } from '@common/exceptions/application.exception';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class AnswerVoteUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  async execute(currentUserId: string, roomId: string, voteId: string, dto: CastVoteDto): Promise<GroupVoteDto> {
    this.logger.log('투표 참여/수정', 'AnswerVoteUseCase', { currentUserId, roomId, voteId });

    const isParticipant = await this.chatRepo.isParticipant(roomId, currentUserId);
    if (!isParticipant) {
      throw new ForbiddenException('채팅방 참여자만 투표에 참여할 수 있습니다.');
    }

    const vote = await this.chatRepo.findVoteById(voteId);
    if (!vote || vote.roomId !== roomId) {
      throw new EntityNotFoundException('투표', voteId);
    }

    if (vote.status === 'CLOSED') {
      throw new BusinessRuleException('종료된 투표에는 참여할 수 없습니다.');
    }

    if (!vote.allowMultiple) {
      if (dto.placeIds.length > 1 || dto.timeIds.length > 1) {
        throw new BusinessRuleException('이 투표는 장소/시간 각각 단일 선택만 허용합니다.');
      }
    }

    const validPlaceIds = new Set(vote.placeOptions.map((o) => o.id));
    const validTimeIds = new Set(vote.timeOptions.map((o) => o.id));

    for (const id of dto.placeIds) {
      if (!validPlaceIds.has(id)) throw new BusinessRuleException(`존재하지 않는 장소 옵션입니다: ${id}`);
    }
    for (const id of dto.timeIds) {
      if (!validTimeIds.has(id)) throw new BusinessRuleException(`존재하지 않는 시간 옵션입니다: ${id}`);
    }

    await this.chatRepo.castVote(voteId, currentUserId, dto.placeIds, dto.timeIds);

    const [updated, totalMembers] = await Promise.all([
      this.chatRepo.findVoteById(voteId),
      this.chatRepo.countRoomParticipants(roomId),
    ]);

    if (!updated) throw new EntityNotFoundException('투표', voteId);
    return toGroupVoteDto(updated, currentUserId, totalMembers);
  }
}
