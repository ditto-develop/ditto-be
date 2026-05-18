import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export type ChatRoomStatusDto = 'ACTIVE' | 'ENDED';
export type ChatRoomEndedReasonDto = 'PARTNER_LEFT' | 'SELF_LEFT' | 'EXPIRED' | null;

export class ChatReadReceiptDto {
  @ApiProperty({ description: '읽음 처리한 유저 ID' })
  userId: string;

  @ApiPropertyOptional({ description: '해당 유저가 마지막으로 읽은 메시지 ID' })
  lastReadMessageId: string | null;

  @ApiProperty({ description: '마지막 읽음 처리 시각' })
  readAt: string;
}

export class CreateChatRoomDto {
  @ApiProperty({ description: '매칭 요청 ID' })
  @IsString()
  matchRequestId: string;
}

export class ChatRoomItemDto {
  @ApiProperty({ description: '채팅방 ID' })
  roomId: string;

  @ApiProperty({ description: '파트너 닉네임' })
  partnerNickname: string;

  @ApiPropertyOptional({ description: '파트너 프로필 이미지 URL' })
  partnerAvatarUrl: string | null;

  @ApiPropertyOptional({ description: '마지막 메시지 내용' })
  lastMessageContent: string | null;

  @ApiPropertyOptional({ description: '마지막 메시지 시각 (ISO8601)' })
  lastMessageAt: string | null;

  @ApiProperty({ description: '안읽은 메시지 수' })
  unreadCount: number;

  @ApiPropertyOptional({ description: '채팅방 만료 시각 (ISO8601)' })
  expiresAt: string | null;

  @ApiProperty({ description: '그룹 채팅방 여부' })
  isGroup: boolean;

  @ApiPropertyOptional({ description: '그룹방 두 번째 참여자 아바타 URL' })
  coParticipantAvatarUrl: string | null;

  @ApiProperty({ description: '채팅방 상태', enum: ['ACTIVE', 'ENDED'] })
  status: ChatRoomStatusDto;

  @ApiProperty({ description: '메시지 전송 가능 여부' })
  canSendMessage: boolean;

  @ApiPropertyOptional({ description: '채팅방 종료 시각 (ISO8601)' })
  endedAt: string | null;

  @ApiPropertyOptional({ description: '채팅방을 종료한 유저 ID' })
  endedByUserId: string | null;

  @ApiPropertyOptional({ description: '요청 사용자 기준 종료 사유', enum: ['PARTNER_LEFT', 'SELF_LEFT', 'EXPIRED'] })
  endedReason: ChatRoomEndedReasonDto;

  @ApiProperty({ description: '채팅방 종료 여부' })
  isEnded: boolean;

  @ApiProperty({ description: '상대방 퇴장 여부' })
  isPartnerLeft: boolean;

  @ApiPropertyOptional({ description: '상대방이 마지막으로 읽은 메시지 ID' })
  partnerLastReadMessageId: string | null;
}

export class ChatPartnerDto {
  @ApiProperty({ description: '파트너 유저 ID' })
  userId: string;

  @ApiProperty({ description: '파트너 닉네임' })
  nickname: string;

  @ApiPropertyOptional({ description: '파트너 프로필 이미지 URL' })
  profileImageUrl: string | null;

  @ApiPropertyOptional({ description: '매칭 점수 (0~100)' })
  matchScore: number | null;
}

export class ChatRoomDetailDto {
  @ApiProperty({ description: '채팅방 ID' })
  roomId: string;

  @ApiPropertyOptional({ description: '채팅방 만료 시각 (72시간)' })
  expiresAt: Date | null;

  @ApiProperty({ description: '상대방 정보', type: ChatPartnerDto })
  partner: ChatPartnerDto;

  @ApiProperty({ description: '채팅방 상태', enum: ['ACTIVE', 'ENDED'] })
  status: ChatRoomStatusDto;

  @ApiProperty({ description: '메시지 전송 가능 여부' })
  canSendMessage: boolean;

  @ApiPropertyOptional({ description: '채팅방 종료 시각' })
  endedAt: string | null;

  @ApiPropertyOptional({ description: '채팅방을 종료한 유저 ID' })
  endedByUserId: string | null;

  @ApiPropertyOptional({ description: '요청 사용자 기준 종료 사유', enum: ['PARTNER_LEFT', 'SELF_LEFT', 'EXPIRED'] })
  endedReason: ChatRoomEndedReasonDto;

  @ApiProperty({ description: '채팅방 종료 여부' })
  isEnded: boolean;

  @ApiProperty({ description: '상대방 퇴장 여부' })
  isPartnerLeft: boolean;

  @ApiPropertyOptional({ description: '상대방이 마지막으로 읽은 메시지 ID' })
  partnerLastReadMessageId: string | null;

  @ApiProperty({ description: '참여자별 읽음 정보', type: [ChatReadReceiptDto] })
  readReceipts: ChatReadReceiptDto[];
}

export class LeaveChatRoomDto {
  @ApiPropertyOptional({ description: '나가기 사유' })
  @IsOptional()
  @IsString()
  reason?: string;
}
