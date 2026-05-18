import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository, CHAT_REPOSITORY_TOKEN } from '@module/chat/infrastructure/repository/chat.repository.interface';
import { AddVoteOptionDto, GroupVoteDto } from '@module/chat/application/dto/vote.dto';
import { toGroupVoteDto } from './create-vote.usecase';
import { ForbiddenException } from '@common/exceptions/application.exception';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class AddVoteOptionUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  async execute(currentUserId: string, roomId: string, voteId: string, dto: AddVoteOptionDto): Promise<GroupVoteDto> {
    this.logger.log('투표 옵션 추가', 'AddVoteOptionUseCase', { currentUserId, roomId, voteId });

    const isParticipant = await this.chatRepo.isParticipant(roomId, currentUserId);
    if (!isParticipant) {
      throw new ForbiddenException('채팅방 참여자만 옵션을 추가할 수 있습니다.');
    }

    const vote = await this.chatRepo.findVoteById(voteId);
    if (!vote || vote.roomId !== roomId) {
      throw new EntityNotFoundException('투표', voteId);
    }

    if (vote.status === 'CLOSED') {
      throw new BusinessRuleException('종료된 투표에는 옵션을 추가할 수 없습니다.');
    }

    const label = dto.type === 'TIME' ? (dto.dateLabel ?? dto.label ?? '') : (dto.label ?? '');
    if (!label.trim()) {
      throw new BusinessRuleException('옵션 레이블이 필요합니다.');
    }

    const [updated, totalMembers] = await Promise.all([
      this.chatRepo.addVoteOption({
        voteId,
        type: dto.type,
        label,
        address: dto.address,
        mapLink: dto.mapLink,
        latitude: dto.latitude,
        longitude: dto.longitude,
        date: dto.date,
        time: dto.time,
        order: 9999, // addVoteOption이 내부적으로 max+1 계산
      }),
      this.chatRepo.countRoomParticipants(roomId),
    ]);

    return toGroupVoteDto(updated, currentUserId, totalMembers);
  }
}
