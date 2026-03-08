import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { ApiCommonErrorResponses } from '@common/command/api-error-response.decorator';
import { ICommandResult } from '@common/command/command.interface';
import { JwtAuthGuard } from '@module/user/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@module/user/infrastructure/decorators/current-user.decorator';
import { User } from '@module/user/domain/entities/user.entity';

import { ChatRoomItemDto, CreateChatRoomDto } from '@module/chat/application/dto/chat-room.dto';
import { ChatMessageDto, MessageListDto, SendMessageDto } from '@module/chat/application/dto/chat-message.dto';
import { GetChatRoomsCommand } from '@module/chat/presentation/commands/get-chat-rooms.command';
import { CreateChatRoomCommand } from '@module/chat/presentation/commands/create-chat-room.command';
import { GetMessagesCommand } from '@module/chat/presentation/commands/get-messages.command';
import { SendMessageCommand } from '@module/chat/presentation/commands/send-message.command';
import { MarkAsReadCommand } from '@module/chat/presentation/commands/mark-as-read.command';

@ApiTags('Chat')
@Controller('chat')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiCommonErrorResponses()
export class ChatController {
    constructor(private readonly commandBus: CommandBus) { }

    @Get('rooms')
    @ApiOperation({
        summary: '채팅방 목록 조회',
        description: '내가 참여 중인 채팅방 목록을 조회합니다. 최신 메시지, 안읽은 수를 포함합니다.',
    })
    @ApiCommandResponse(200, '채팅방 목록 조회 성공', ChatRoomItemDto, true)
    async getChatRooms(
        @CurrentUser() user: User,
    ): Promise<ICommandResult<ChatRoomItemDto[]>> {
        const command = new GetChatRoomsCommand(user.id);
        return await this.commandBus.execute<ChatRoomItemDto[]>(command);
    }

    @Post('rooms')
    @ApiOperation({
        summary: '채팅방 생성',
        description: '매칭 성사된 상대와의 채팅방을 생성합니다. 이미 존재하면 기존 방을 반환합니다.',
    })
    @ApiCommandResponse(201, '채팅방 생성 성공', ChatRoomItemDto)
    async createChatRoom(
        @CurrentUser() user: User,
        @Body() dto: CreateChatRoomDto,
    ): Promise<ICommandResult<ChatRoomItemDto>> {
        const command = new CreateChatRoomCommand(user.id, dto);
        return await this.commandBus.execute<ChatRoomItemDto>(command);
    }

    @Get('rooms/:roomId/messages')
    @ApiOperation({
        summary: '메시지 목록 조회',
        description: '채팅방의 메시지를 커서 기반 페이지네이션으로 조회합니다. 최신순 정렬입니다.',
    })
    @ApiParam({ name: 'roomId', description: '채팅방 ID' })
    @ApiQuery({ name: 'cursor', required: false, description: '페이지 커서 (이전 응답의 nextCursor)' })
    @ApiQuery({ name: 'limit', required: false, description: '조회 건수 (기본 30)', type: Number })
    @ApiCommandResponse(200, '메시지 조회 성공', MessageListDto)
    async getMessages(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
        @Query('cursor') cursor?: string,
        @Query('limit') limit?: string,
    ): Promise<ICommandResult<MessageListDto>> {
        const command = new GetMessagesCommand(
            user.id, roomId, cursor, limit ? parseInt(limit, 10) : undefined,
        );
        return await this.commandBus.execute<MessageListDto>(command);
    }

    @Post('rooms/:roomId/messages')
    @ApiOperation({
        summary: '메시지 전송',
        description: '채팅방에 메시지를 전송합니다. 참여자만 전송 가능합니다.',
    })
    @ApiParam({ name: 'roomId', description: '채팅방 ID' })
    @ApiCommandResponse(201, '메시지 전송 성공', ChatMessageDto)
    async sendMessage(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
        @Body() dto: SendMessageDto,
    ): Promise<ICommandResult<ChatMessageDto>> {
        const command = new SendMessageCommand(user.id, roomId, dto);
        return await this.commandBus.execute<ChatMessageDto>(command);
    }

    @Patch('rooms/:roomId/read')
    @ApiOperation({
        summary: '읽음 처리',
        description: '채팅방의 메시지를 현재 시각까지 읽음 처리합니다.',
    })
    @ApiParam({ name: 'roomId', description: '채팅방 ID' })
    @ApiCommandResponse(200, '읽음 처리 성공')
    async markAsRead(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
    ): Promise<ICommandResult<void>> {
        const command = new MarkAsReadCommand(user.id, roomId);
        return await this.commandBus.execute<void>(command);
    }
}
