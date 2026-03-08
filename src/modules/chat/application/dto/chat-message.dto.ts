import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { ChatMessage, MESSAGE_MAX_LENGTH } from '@module/chat/domain/entities/chat-message.entity';

export class SendMessageDto {
    @ApiProperty({ description: `메시지 내용 (최대 ${MESSAGE_MAX_LENGTH}자)` })
    @IsString()
    @MaxLength(MESSAGE_MAX_LENGTH)
    content: string;
}

export class ChatMessageDto {
    @ApiProperty({ description: '메시지 ID' }) id: string;
    @ApiProperty({ description: '발신자 ID' }) senderId: string;
    @ApiProperty({ description: '메시지 내용' }) content: string;
    @ApiProperty({ description: '생성일' }) createdAt: Date;

    static fromDomain(msg: ChatMessage): ChatMessageDto {
        const dto = new ChatMessageDto();
        dto.id = msg.id;
        dto.senderId = msg.senderId;
        dto.content = msg.isDeleted ? '' : msg.content;
        dto.createdAt = msg.createdAt;
        return dto;
    }
}

export class MessageListDto {
    @ApiProperty({ description: '메시지 목록', type: [ChatMessageDto] })
    messages: ChatMessageDto[];

    @ApiPropertyOptional({ description: '다음 페이지 커서 (없으면 마지막 페이지)' })
    nextCursor: string | null;
}
