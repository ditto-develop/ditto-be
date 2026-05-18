import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { IChatRepository, ChatRoomWithMeta, ChatRoomDetail, ChatReadReceipt, GroupChatRoomDetail, GroupMessageWithMeta, VoteData, CreateVoteInput, AddVoteOptionInput } from './chat.repository.interface';
import { ChatRoom } from '@module/chat/domain/entities/chat-room.entity';
import { ChatMessage } from '@module/chat/domain/entities/chat-message.entity';

const DEFAULT_PAGE_SIZE = 30;

@Injectable()
export class ChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRoomDomain(row: any): ChatRoom {
    return new ChatRoom(
      row.id,
      row.matchRequestId,
      row.createdAt,
      row.updatedAt,
      row.expiresAt ?? null,
      row.status ?? 'ACTIVE',
      row.endedAt ?? null,
      row.endedByUserId ?? null,
      row.endedReason ?? null,
    );
  }

  private toMessageDomain(row: any): ChatMessage {
    return new ChatMessage(row.id, row.roomId, row.senderId ?? null, row.type ?? 'CHAT', row.content, row.deletedAt, row.createdAt, row.updatedAt);
  }

  private async toReadReceipts(
    roomId: string,
    participants: { userId: string; lastReadAt: Date }[],
  ): Promise<ChatReadReceipt[]> {
    return await Promise.all(
      participants.map(async (participant) => {
        const lastReadMessage = await this.prisma.chatMessage.findFirst({
          where: {
            roomId,
            deletedAt: null,
            createdAt: { lte: participant.lastReadAt },
          },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
        });

        return {
          userId: participant.userId,
          lastReadMessageId: lastReadMessage?.id ?? null,
          readAt: participant.lastReadAt,
        };
      }),
    );
  }

  async createRoom(room: ChatRoom, participantUserIds: string[]): Promise<ChatRoom> {
    const row = await this.prisma.chatRoom.create({
      data: {
        id: room.id,
        matchRequestId: room.matchRequestId,
        expiresAt: room.expiresAt,
        status: room.status,
        endedAt: room.endedAt,
        endedByUserId: room.endedByUserId,
        endedReason: room.endedReason,
        participants: {
          create: participantUserIds.map((userId) => ({ userId })),
        },
      },
    });
    return this.toRoomDomain(row);
  }

  async findRoomById(roomId: string): Promise<ChatRoom | null> {
    const row = await this.prisma.chatRoom.findUnique({ where: { id: roomId } });
    return row ? this.toRoomDomain(row) : null;
  }

  async findRoomByMatchRequestId(matchRequestId: string): Promise<ChatRoom | null> {
    const row = await this.prisma.chatRoom.findUnique({ where: { matchRequestId } });
    return row ? this.toRoomDomain(row) : null;
  }

  async findRoomByParticipants(userIdA: string, userIdB: string): Promise<ChatRoom | null> {
    const row = await this.prisma.chatRoom.findFirst({
      where: {
        AND: [{ participants: { some: { userId: userIdA } } }, { participants: { some: { userId: userIdB } } }],
      },
    });
    return row ? this.toRoomDomain(row) : null;
  }

  async findRoomsByUserId(userId: string): Promise<ChatRoomWithMeta[]> {
    const participantRows = await this.prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    nickname: true,
                    profile: { select: { profileImageUrl: true } },
                  },
                },
              },
            },
            messages: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { room: { updatedAt: 'desc' } },
    });

    const results: ChatRoomWithMeta[] = await Promise.all(
      participantRows.map(async (p) => {
        const room = this.toRoomDomain(p.room);
        const isGroup = (p.room as any).quizSetId !== null;
        const partnerUsers = p.room.participants
          .filter((pt: any) => pt.userId !== userId)
          .map((pt: any) => ({
            userId: pt.user.id,
            nickname: pt.user.nickname,
            profileImageUrl: pt.user.profile?.profileImageUrl ?? null,
          }));
        const lastMessage = p.room.messages.length > 0 ? this.toMessageDomain(p.room.messages[0]) : null;

        const unreadCount = await this.prisma.chatMessage.count({
          where: {
            roomId: p.roomId,
            deletedAt: null,
            createdAt: { gt: p.lastReadAt },
            senderId: { not: userId },
          },
        });
        const readReceipts = await this.toReadReceipts(p.roomId, p.room.participants);

        return { room, isGroup, partnerUsers, lastMessage, unreadCount, readReceipts };
      }),
    );

    return results;
  }

  async findRoomDetailById(roomId: string, currentUserId: string): Promise<ChatRoomDetail | null> {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                profile: {
                  select: { profileImageUrl: true },
                },
              },
            },
          },
        },
        matchRequest: {
          select: { score: true },
        },
      },
    });

    if (!room) return null;

    const partnerParticipant = room.participants.find((p) => p.userId !== currentUserId);
    if (!partnerParticipant) return null;

    return {
      roomId: room.id,
      expiresAt: room.expiresAt,
      partner: {
        userId: partnerParticipant.user.id,
        nickname: partnerParticipant.user.nickname,
        profileImageUrl: partnerParticipant.user.profile?.profileImageUrl ?? null,
        matchScore: room.matchRequest?.score ?? null,
      },
      readReceipts: await this.toReadReceipts(roomId, room.participants),
    };
  }

  async isParticipant(roomId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.chatParticipant.count({
      where: { roomId, userId },
    });
    return count > 0;
  }

  async closeRoom(roomId: string, endedByUserId: string, endedAt: Date): Promise<void> {
    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        status: 'ENDED',
        endedAt,
        endedByUserId,
        endedReason: 'USER_LEFT',
      },
    });
  }

  async createMessage(message: ChatMessage): Promise<ChatMessage> {
    const [row] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: {
          id: message.id,
          roomId: message.roomId,
          senderId: message.senderId,
          type: message.type,
          content: message.content,
        },
      }),
      this.prisma.chatRoom.update({
        where: { id: message.roomId },
        data: { updatedAt: new Date() },
      }),
    ]);
    return this.toMessageDomain(row);
  }

  async findMessagesByRoomId(
    roomId: string,
    cursor?: string,
    limit: number = DEFAULT_PAGE_SIZE,
  ): Promise<{ messages: ChatMessage[]; nextCursor: string | null }> {
    let cursorDate: Date | undefined;
    if (cursor) {
      const cursorMessage = await this.prisma.chatMessage.findUnique({ where: { id: cursor } });
      if (cursorMessage) cursorDate = cursorMessage.createdAt;
    }

    const rows = await this.prisma.chatMessage.findMany({
      where: {
        roomId,
        deletedAt: null,
        ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    const hasNext = rows.length > limit;
    const messages = (hasNext ? rows.slice(0, limit) : rows).map((r) => this.toMessageDomain(r));
    const nextCursor = hasNext ? messages[messages.length - 1].id : null;

    return { messages, nextCursor };
  }

  async updateLastReadAt(roomId: string, userId: string, readAt: Date): Promise<void> {
    await this.prisma.chatParticipant.update({
      where: { roomId_userId: { roomId, userId } },
      data: { lastReadAt: readAt },
    });
  }

  async findReadReceiptsByRoomId(roomId: string): Promise<ChatReadReceipt[]> {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { roomId },
      select: { userId: true, lastReadAt: true },
    });

    return await this.toReadReceipts(roomId, participants);
  }

  // ─── Group Chat ──────────────────────────────────────────────────────────────

  async findGroupRoomDetailById(roomId: string): Promise<GroupChatRoomDetail | null> {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                profile: { select: { profileImageUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!room || room.quizSetId === null) return null;

    const domainRoom = this.toRoomDomain(room);

    return {
      roomId: room.id,
      members: room.participants.map((p: any) => ({
        userId: p.user.id,
        nickname: p.user.nickname,
        avatarUrl: p.user.profile?.profileImageUrl ?? null,
        lastReadAt: p.lastReadAt,
      })),
      expiresAt: room.expiresAt,
      isEnded: domainRoom.isEnded,
    };
  }

  async findGroupMessagesByRoomId(
    roomId: string,
    cursor?: string,
    limit: number = DEFAULT_PAGE_SIZE,
  ): Promise<{ messages: GroupMessageWithMeta[]; nextCursor: string | null }> {
    let cursorDate: Date | undefined;
    if (cursor) {
      const cursorMessage = await this.prisma.chatMessage.findUnique({ where: { id: cursor } });
      if (cursorMessage) cursorDate = cursorMessage.createdAt;
    }

    const rows = await this.prisma.chatMessage.findMany({
      where: {
        roomId,
        deletedAt: null,
        ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
      },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            profile: { select: { profileImageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    // 모든 참여자의 lastReadAt을 한 번에 가져와 메시지별 unreadCount 계산
    const participants = await this.prisma.chatParticipant.findMany({
      where: { roomId },
      select: { userId: true, lastReadAt: true },
    });

    const hasNext = rows.length > limit;
    const slicedRows = hasNext ? rows.slice(0, limit) : rows;

    const messages: GroupMessageWithMeta[] = slicedRows.map((row: any) => {
      const isNonChat = row.type === 'SYSTEM' || row.type === 'VOTE_OPENED';
      const unreadCount = isNonChat
        ? 0
        : participants.filter(
            (p) => p.userId !== row.senderId && p.lastReadAt < row.createdAt,
          ).length;

      let voteMeta: GroupMessageWithMeta['voteMeta'] | undefined;
      if (row.type === 'VOTE_OPENED') {
        try {
          voteMeta = JSON.parse(row.content);
        } catch {
          // ignore malformed content
        }
      }

      return {
        id: row.id,
        roomId: row.roomId,
        type: row.type as 'CHAT' | 'SYSTEM' | 'VOTE_OPENED',
        senderId: row.senderId ?? null,
        senderNickname: row.sender?.nickname ?? '',
        senderAvatarUrl: row.sender?.profile?.profileImageUrl ?? null,
        content: row.deletedAt ? '' : row.content,
        createdAt: row.createdAt,
        unreadCount,
        ...(voteMeta ? { voteMeta } : {}),
      };
    });

    const nextCursor = hasNext ? messages[messages.length - 1].id : null;
    return { messages, nextCursor };
  }

  // ─── Vote ────────────────────────────────────────────────────────────────────

  private static readonly VOTE_INCLUDE = {
    options: { include: { answers: true }, orderBy: { order: 'asc' as const } },
  };

  private toVoteData(vote: any): VoteData {
    const options: any[] = vote.options ?? [];
    return {
      id: vote.id,
      roomId: vote.roomId,
      title: vote.title,
      allowMultiple: vote.allowMultiple,
      status: vote.status,
      closedAt: vote.closedAt ?? null,
      createdAt: vote.createdAt,
      createdByUserId: vote.createdByUserId,
      placeOptions: options
        .filter((opt) => opt.optionType === 'PLACE')
        .map((opt) => ({
          id: opt.id,
          label: opt.label,
          address: opt.address ?? null,
          mapLink: opt.mapLink ?? null,
          latitude: opt.latitude ?? null,
          longitude: opt.longitude ?? null,
          order: opt.order,
          voterIds: (opt.answers ?? []).map((a: any) => a.userId),
        })),
      timeOptions: options
        .filter((opt) => opt.optionType === 'TIME')
        .map((opt) => ({
          id: opt.id,
          label: opt.label,    // dateLabel
          date: opt.date ?? null,
          time: opt.time ?? null,
          order: opt.order,
          voterIds: (opt.answers ?? []).map((a: any) => a.userId),
        })),
    };
  }

  async createVote(input: CreateVoteInput): Promise<VoteData> {
    const placeOpts = input.placeOptions.map((opt) => ({
      optionType: 'PLACE' as const,
      label: opt.label,
      address: opt.address ?? null,
      mapLink: opt.mapLink ?? null,
      latitude: opt.latitude ?? null,
      longitude: opt.longitude ?? null,
      date: null,
      time: null,
      order: opt.order,
    }));
    const timeOpts = input.timeOptions.map((opt) => ({
      optionType: 'TIME' as const,
      label: opt.label,
      mapLink: null,
      latitude: null,
      longitude: null,
      date: opt.date ?? null,
      time: opt.time ?? null,
      order: opt.order,
    }));

    const vote = await this.prisma.chatVote.create({
      data: {
        roomId: input.roomId,
        createdByUserId: input.createdByUserId,
        title: input.title,
        allowMultiple: input.allowMultiple,
        options: { create: [...placeOpts, ...timeOpts] },
      },
      include: ChatRepository.VOTE_INCLUDE,
    });
    return this.toVoteData(vote);
  }

  async findActiveVoteByRoomId(roomId: string): Promise<VoteData | null> {
    const vote = await this.prisma.chatVote.findFirst({
      where: { roomId, status: 'ACTIVE' },
      include: ChatRepository.VOTE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return vote ? this.toVoteData(vote) : null;
  }

  async findVoteById(voteId: string): Promise<VoteData | null> {
    const vote = await this.prisma.chatVote.findUnique({
      where: { id: voteId },
      include: ChatRepository.VOTE_INCLUDE,
    });
    return vote ? this.toVoteData(vote) : null;
  }

  async hasActiveVote(roomId: string): Promise<boolean> {
    const count = await this.prisma.chatVote.count({
      where: { roomId, status: 'ACTIVE' },
    });
    return count > 0;
  }

  async addVoteOption(input: AddVoteOptionInput): Promise<VoteData> {
    // 현재 해당 타입 옵션의 최대 order 계산
    const maxOrder = await this.prisma.chatVoteOption.aggregate({
      where: { voteId: input.voteId, optionType: input.type },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    await this.prisma.chatVoteOption.create({
      data: {
        voteId: input.voteId,
        optionType: input.type,
        label: input.label,
        address: input.type === 'PLACE' ? (input.address ?? null) : null,
        mapLink: input.type === 'PLACE' ? (input.mapLink ?? null) : null,
        latitude: input.type === 'PLACE' ? (input.latitude ?? null) : null,
        longitude: input.type === 'PLACE' ? (input.longitude ?? null) : null,
        date: input.type === 'TIME' ? (input.date ?? null) : null,
        time: input.type === 'TIME' ? (input.time ?? null) : null,
        order: input.order ?? nextOrder,
      },
    });

    const vote = await this.prisma.chatVote.findUnique({
      where: { id: input.voteId },
      include: ChatRepository.VOTE_INCLUDE,
    });
    return this.toVoteData(vote!);
  }

  async castVote(voteId: string, userId: string, placeIds: string[], timeIds: string[]): Promise<void> {
    const allOptionIds = [...placeIds, ...timeIds];
    await this.prisma.$transaction(async (tx) => {
      await tx.chatVoteAnswer.deleteMany({ where: { voteId, userId } });
      if (allOptionIds.length > 0) {
        await tx.chatVoteAnswer.createMany({
          data: allOptionIds.map((optionId) => ({
            id: uuidv4(),
            voteId,
            optionId,
            userId,
          })),
        });
      }
    });
  }

  async closeVote(voteId: string): Promise<void> {
    await this.prisma.chatVote.update({
      where: { id: voteId },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }

  async countRoomParticipants(roomId: string): Promise<number> {
    return this.prisma.chatParticipant.count({ where: { roomId } });
  }

  async removeGroupParticipant(roomId: string, userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 나가는 유저의 닉네임 조회 (시스템 메시지 생성용)
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { nickname: true },
      });

      await tx.chatParticipant.delete({
        where: { roomId_userId: { roomId, userId } },
      });

      // 시스템 메시지 생성
      await tx.chatMessage.create({
        data: {
          id: uuidv4(),
          roomId,
          senderId: null,
          type: 'SYSTEM',
          content: `${user?.nickname ?? '알 수 없는 사용자'}님이 채팅방을 나갔습니다`,
        },
      });

      // 남은 참여자가 없으면 방 종료
      const remaining = await tx.chatParticipant.count({ where: { roomId } });
      if (remaining === 0) {
        await tx.chatRoom.update({
          where: { id: roomId },
          data: {
            status: 'ENDED',
            endedAt: new Date(),
            endedByUserId: userId,
            endedReason: 'USER_LEFT',
          },
        });
      }
    });
  }
}
