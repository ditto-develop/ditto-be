import { ChatRoom } from '@module/chat/domain/entities/chat-room.entity';
import { ChatMessage } from '@module/chat/domain/entities/chat-message.entity';

export interface PartnerUserInfo {
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
}

export interface ChatReadReceipt {
  userId: string;
  lastReadMessageId: string | null;
  readAt: Date;
}

export interface ChatRoomWithMeta {
  room: ChatRoom;
  isGroup: boolean;
  partnerUsers: PartnerUserInfo[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
  readReceipts: ChatReadReceipt[];
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
  readReceipts: ChatReadReceipt[];
}

// ─── Group Chat ───────────────────────────────────────────────────────────────

export interface GroupMemberInfo {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  lastReadAt: Date;
}

export interface GroupChatRoomDetail {
  roomId: string;
  members: GroupMemberInfo[];
  expiresAt: Date | null;
  isEnded: boolean;
}

export interface VoteMessageMeta {
  voteId: string;
  placeSummary: { head: string; extraCount: number };
  timeSummary: { head: string; extraCount: number };
}

export interface GroupMessageWithMeta {
  id: string;
  roomId: string;
  type: 'CHAT' | 'SYSTEM' | 'VOTE_OPENED';
  senderId: string | null;
  senderNickname: string;
  senderAvatarUrl: string | null;
  content: string;
  createdAt: Date;
  unreadCount: number;
  voteMeta?: VoteMessageMeta;
}

// ─── Vote ─────────────────────────────────────────────────────────────────────

export interface VotePlaceOptionData {
  id: string;
  label: string;
  address: string | null;
  mapLink: string | null;
  latitude: number | null;
  longitude: number | null;
  order: number;
  voterIds: string[];
}

export interface VoteTimeOptionData {
  id: string;
  label: string;   // dateLabel
  date: string | null;
  time: string | null;
  order: number;
  voterIds: string[];
}

export interface VoteData {
  id: string;
  roomId: string;
  title: string;
  allowMultiple: boolean;
  status: 'ACTIVE' | 'CLOSED';
  closedAt: Date | null;
  createdAt: Date;
  createdByUserId: string;
  placeOptions: VotePlaceOptionData[];
  timeOptions: VoteTimeOptionData[];
}

export interface CreateVoteInput {
  roomId: string;
  createdByUserId: string;
  title: string;
  allowMultiple: boolean;
  placeOptions: Array<{ label: string; address?: string; mapLink?: string; latitude?: number; longitude?: number; order: number }>;
  timeOptions: Array<{ label: string; date?: string; time?: string; order: number }>;
}

export interface AddVoteOptionInput {
  voteId: string;
  type: 'PLACE' | 'TIME';
  label: string;
  address?: string;
  mapLink?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  time?: string;
  order: number;
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
  closeRoom(roomId: string, endedByUserId: string, endedAt: Date): Promise<void>;

  // Message
  createMessage(message: ChatMessage): Promise<ChatMessage>;
  findMessagesByRoomId(
    roomId: string,
    cursor?: string,
    limit?: number,
  ): Promise<{ messages: ChatMessage[]; nextCursor: string | null }>;

  // Read
  updateLastReadAt(roomId: string, userId: string, readAt: Date): Promise<void>;
  findReadReceiptsByRoomId(roomId: string): Promise<ChatReadReceipt[]>;

  // Group Chat
  findGroupRoomDetailById(roomId: string): Promise<GroupChatRoomDetail | null>;
  findGroupMessagesByRoomId(
    roomId: string,
    cursor?: string,
    limit?: number,
  ): Promise<{ messages: GroupMessageWithMeta[]; nextCursor: string | null }>;
  removeGroupParticipant(roomId: string, userId: string): Promise<void>;

  // Vote
  createVote(input: CreateVoteInput): Promise<VoteData>;
  findActiveVoteByRoomId(roomId: string): Promise<VoteData | null>;
  findVoteById(voteId: string): Promise<VoteData | null>;
  hasActiveVote(roomId: string): Promise<boolean>;
  addVoteOption(input: AddVoteOptionInput): Promise<VoteData>;
  castVote(voteId: string, userId: string, placeIds: string[], timeIds: string[]): Promise<void>;
  closeVote(voteId: string): Promise<void>;
  countRoomParticipants(roomId: string): Promise<number>;
}

export const CHAT_REPOSITORY_TOKEN = Symbol('IChatRepository');
