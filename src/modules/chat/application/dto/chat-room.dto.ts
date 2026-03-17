import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ChatMessageDto } from './chat-message.dto';

export class CreateChatRoomDto {
    @ApiProperty({ description: '매칭 요청 ID' })
    @IsString()
    matchRequestId: string;
}

export class ChatRoomItemDto {
    @ApiProperty({ description: '채팅방 ID' })
    roomId: string;

    @ApiProperty({ description: '매칭 요청 ID' })
    matchRequestId: string | null;

    @ApiProperty({ description: '참여자 ID 목록', type: [String] })
    participantUserIds: string[];

    @ApiPropertyOptional({ description: '마지막 메시지', type: ChatMessageDto })
    lastMessage: ChatMessageDto | null;

    @ApiProperty({ description: '안읽은 메시지 수' })
    unreadCount: number;

    @ApiProperty({ description: '생성일' })
    createdAt: Date;
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
}

export class LeaveChatRoomDto {
    @ApiPropertyOptional({ description: '나가기 사유' })
    @IsOptional()
    @IsString()
    reason?: string;
}
