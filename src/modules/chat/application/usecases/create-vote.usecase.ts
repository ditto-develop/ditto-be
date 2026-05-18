import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IChatRepository, CHAT_REPOSITORY_TOKEN, VoteData } from '@module/chat/infrastructure/repository/chat.repository.interface';
import { CreateVoteDto, GroupVoteDto, VoteStatus } from '@module/chat/application/dto/vote.dto';
import { ForbiddenException } from '@common/exceptions/application.exception';
import { BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';
import { ChatMessage } from '@module/chat/domain/entities/chat-message.entity';

export function toGroupVoteDto(vote: VoteData, currentUserId: string, totalMembers: number): GroupVoteDto {
  const myPlaceIds = vote.placeOptions
    .filter((opt) => opt.voterIds.includes(currentUserId))
    .map((opt) => opt.id);
  const myTimeIds = vote.timeOptions
    .filter((opt) => opt.voterIds.includes(currentUserId))
    .map((opt) => opt.id);

  const hasMyVote = myPlaceIds.length > 0 || myTimeIds.length > 0;

  const allVoterIds = new Set([
    ...vote.placeOptions.flatMap((o) => o.voterIds),
    ...vote.timeOptions.flatMap((o) => o.voterIds),
  ]);

  return {
    id: vote.id,
    title: vote.title,
    allowMultiple: vote.allowMultiple,
    placeOptions: vote.placeOptions.map((opt) => ({
      id: opt.id,
      label: opt.label,
      address: opt.address,
      mapLink: opt.mapLink,
      latitude: opt.latitude,
      longitude: opt.longitude,
      voterIds: opt.voterIds,
    })),
    timeOptions: vote.timeOptions.map((opt) => ({
      id: opt.id,
      dateLabel: opt.label,
      date: opt.date,
      time: opt.time,
      voterIds: opt.voterIds,
    })),
    totalMembers,
    votedCount: allVoterIds.size,
    myVote: hasMyVote ? { placeIds: myPlaceIds, timeIds: myTimeIds } : null,
    status: vote.status === 'ACTIVE' ? VoteStatus.OPEN : VoteStatus.CLOSED,
  };
}

@Injectable()
export class CreateVoteUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  async execute(currentUserId: string, roomId: string, dto: CreateVoteDto): Promise<GroupVoteDto> {
    this.logger.log('그룹 채팅 투표 생성', 'CreateVoteUseCase', { currentUserId, roomId });

    const isParticipant = await this.chatRepo.isParticipant(roomId, currentUserId);
    if (!isParticipant) {
      throw new ForbiddenException('채팅방 참여자만 투표를 생성할 수 있습니다.');
    }

    const placeOptions = dto.placeOptions ?? [];
    const timeOptions = dto.timeOptions ?? [];

    if (placeOptions.length + timeOptions.length < 2) {
      throw new BusinessRuleException('투표 옵션은 장소/시간 합산 최소 2개 이상이어야 합니다.');
    }

    const hasActive = await this.chatRepo.hasActiveVote(roomId);
    if (hasActive) {
      throw new BusinessRuleException('이미 진행 중인 투표가 있습니다. 기존 투표를 종료 후 새 투표를 생성하세요.');
    }

    const [vote, totalMembers] = await Promise.all([
      this.chatRepo.createVote({
        roomId,
        createdByUserId: currentUserId,
        title: dto.title,
        allowMultiple: dto.allowMultiple,
        placeOptions: placeOptions.map((opt, i) => ({
          label: opt.label,
          address: opt.address,
          mapLink: opt.mapLink,
          latitude: opt.latitude,
          longitude: opt.longitude,
          order: i,
        })),
        timeOptions: timeOptions.map((opt, i) => ({ label: opt.dateLabel, date: opt.date, time: opt.time, order: i })),
      }),
      this.chatRepo.countRoomParticipants(roomId),
    ]);

    const placeHead = vote.placeOptions[0]?.label ?? '';
    const timeHead = vote.timeOptions[0]?.label ?? '';
    const voteMeta = JSON.stringify({
      voteId: vote.id,
      placeSummary: { head: placeHead, extraCount: Math.max(0, vote.placeOptions.length - 1) },
      timeSummary: { head: timeHead, extraCount: Math.max(0, vote.timeOptions.length - 1) },
    });
    await this.chatRepo.createMessage(
      ChatMessage.createVoteOpened(uuidv4(), roomId, currentUserId, voteMeta),
    );

    return toGroupVoteDto(vote, currentUserId, totalMembers);
  }
}
