import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { IChatRepository, ChatRoomWithMeta, ChatRoomDetail } from './chat.repository.interface';
import { ChatRoom } from '@module/chat/domain/entities/chat-room.entity';
import { ChatMessage } from '@module/chat/domain/entities/chat-message.entity';

const DEFAULT_PAGE_SIZE = 30;

@Injectable()
export class ChatRepository implements IChatRepository {
    constructor(private readonly prisma: PrismaService) { }

    private toRoomDomain(row: any): ChatRoom {
        return new ChatRoom(row.id, row.matchRequestId, row.createdAt, row.updatedAt, row.expiresAt ?? null);
    }

    private toMessageDomain(row: any): ChatMessage {
        return new ChatMessage(
            row.id, row.roomId, row.senderId, row.content,
            row.deletedAt, row.createdAt, row.updatedAt,
        );
    }

    async createRoom(room: ChatRoom, participantUserIds: string[]): Promise<ChatRoom> {
        const row = await this.prisma.chatRoom.create({
            data: {
                id: room.id,
                matchRequestId: room.matchRequestId,
                expiresAt: room.expiresAt,
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
                AND: [
                    { participants: { some: { userId: userIdA } } },
                    { participants: { some: { userId: userIdB } } },
                ],
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
                        participants: { select: { userId: true } },
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
                const participantUserIds = p.room.participants.map((pt: any) => pt.userId);
                const lastMessage = p.room.messages.length > 0
                    ? this.toMessageDomain(p.room.messages[0])
                    : null;

                const unreadCount = await this.prisma.chatMessage.count({
                    where: {
                        roomId: p.roomId,
                        deletedAt: null,
                        createdAt: { gt: p.lastReadAt },
                        senderId: { not: userId },
                    },
                });

                return { room, participantUserIds, lastMessage, unreadCount };
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
        };
    }

    async isParticipant(roomId: string, userId: string): Promise<boolean> {
        const count = await this.prisma.chatParticipant.count({
            where: { roomId, userId },
        });
        return count > 0;
    }

    async removeParticipant(roomId: string, userId: string): Promise<void> {
        await this.prisma.chatParticipant.delete({
            where: { roomId_userId: { roomId, userId } },
        });
    }

    async createMessage(message: ChatMessage): Promise<ChatMessage> {
        const [row] = await this.prisma.$transaction([
            this.prisma.chatMessage.create({
                data: {
                    id: message.id,
                    roomId: message.roomId,
                    senderId: message.senderId,
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
}
