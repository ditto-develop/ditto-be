import { Inject, Injectable } from '@nestjs/common';
import { IChatRepository, CHAT_REPOSITORY_TOKEN } from '@module/chat/infrastructure/repository/chat.repository.interface';
import { GroupChatRoomDetailDto } from '@module/chat/application/dto/group-chat.dto';
import { GroupVoteDto } from '@module/chat/application/dto/vote.dto';
import { toGroupVoteDto } from './create-vote.usecase';
import { EntityNotFoundException } from '@common/exceptions/domain.exception';
import { ForbiddenException } from '@common/exceptions/application.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetGroupRoomDetailUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN) private readonly chatRepo: IChatRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  async execute(currentUserId: string, roomId: string): Promise<GroupChatRoomDetailDto> {
    this.logger.log('그룹 채팅방 상세 조회', 'GetGroupRoomDetailUseCase', { currentUserId, roomId });

    const isParticipant = await this.chatRepo.isParticipant(roomId, currentUserId);
    if (!isParticipant) {
      throw new ForbiddenException('채팅방 참여자만 조회할 수 있습니다.');
    }

    const [detail, activeVote, totalMembers] = await Promise.all([
      this.chatRepo.findGroupRoomDetailById(roomId),
      this.chatRepo.findActiveVoteByRoomId(roomId),
      this.chatRepo.countRoomParticipants(roomId),
    ]);

    if (!detail) throw new EntityNotFoundException('그룹 채팅방', roomId);

    const vote: GroupVoteDto | null = activeVote
      ? toGroupVoteDto(activeVote, currentUserId, totalMembers)
      : null;

    return {
      roomId: detail.roomId,
      members: detail.members.map((m) => ({
        userId: m.userId,
        nickname: m.nickname,
        avatarUrl: m.avatarUrl,
      })),
      totalMembers: detail.members.length,
      vote,
      expiresAt: detail.expiresAt ? detail.expiresAt.toISOString() : null,
      isEnded: detail.isEnded,
    };
  }
}
