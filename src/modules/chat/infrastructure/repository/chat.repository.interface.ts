import { ChatRoom } from '@module/chat/domain/entities/chat-room.entity';
import { ChatMessage } from '@module/chat/domain/entities/chat-message.entity';

export interface ChatRoomWithMeta {
    room: ChatRoom;
    participantUserIds: string[];
    lastMessage: ChatMessage | null;
    unreadCount: number;
}

export interface ChatRoomDetail {
    roomId: string;
    expiresAt: Date | null;
    partner: {
        userId: string;
        nickname: string;
        profileImageUrl: string | null;
        matchScore: number | null;
    };
}

export interface IChatRepository {
    // Room
    createRoom(room: ChatRoom, participantUserIds: string[]): Promise<ChatRoom>;
    findRoomById(roomId: string): Promise<ChatRoom | null>;
    findRoomByMatchRequestId(matchRequestId: string): Promise<ChatRoom | null>;
    findRoomByParticipants(userIdA: string, userIdB: string): Promise<ChatRoom | null>;
    findRoomsByUserId(userId: string): Promise<ChatRoomWithMeta[]>;
    findRoomDetailById(roomId: string, currentUserId: string): Promise<ChatRoomDetail | null>;
    isParticipant(roomId: string, userId: string): Promise<boolean>;
    removeParticipant(roomId: string, userId: string): Promise<void>;

    // Message
    createMessage(message: ChatMessage): Promise<ChatMessage>;
    findMessagesByRoomId(
        roomId: string,
        cursor?: string,
        limit?: number,
    ): Promise<{ messages: ChatMessage[]; nextCursor: string | null }>;

    // Read
    updateLastReadAt(roomId: string, userId: string, readAt: Date): Promise<void>;
}

export const CHAT_REPOSITORY_TOKEN = Symbol('IChatRepository');
