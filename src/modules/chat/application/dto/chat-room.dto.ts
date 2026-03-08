import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
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
