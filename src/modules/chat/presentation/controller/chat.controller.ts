import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { ApiCommonErrorResponses } from '@common/command/api-error-response.decorator';
import { ICommandResult } from '@common/command/command.interface';
import { JwtAuthGuard } from '@module/user/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@module/user/infrastructure/decorators/current-user.decorator';
import { User } from '@module/user/domain/entities/user.entity';

import { ChatRoomItemDto, CreateChatRoomDto, ChatRoomDetailDto, LeaveChatRoomDto } from '@module/chat/application/dto/chat-room.dto';
import { ChatMessageDto, MessageListDto, SendMessageDto } from '@module/chat/application/dto/chat-message.dto';
import { GroupChatRoomDetailDto, GroupMessageListDto, LeaveGroupChatRoomDto } from '@module/chat/application/dto/group-chat.dto';
import {
    CreateVoteDto,
    CastVoteDto,
    AddVoteOptionDto,
    GroupVoteDto,
    KakaoPlaceSearchResultDto,
} from '@module/chat/application/dto/vote.dto';
import { GetChatRoomsCommand } from '@module/chat/presentation/commands/get-chat-rooms.command';
import { CreateChatRoomCommand } from '@module/chat/presentation/commands/create-chat-room.command';
import { GetMessagesCommand } from '@module/chat/presentation/commands/get-messages.command';
import { SendMessageCommand } from '@module/chat/presentation/commands/send-message.command';
import { MarkAsReadCommand } from '@module/chat/presentation/commands/mark-as-read.command';
import { GetChatRoomDetailCommand } from '@module/chat/presentation/commands/get-chat-room-detail.command';
import { LeaveChatRoomCommand } from '@module/chat/presentation/commands/leave-chat-room.command';
import { GetGroupRoomDetailCommand } from '@module/chat/presentation/commands/get-group-room-detail.command';
import { GetGroupMessagesCommand } from '@module/chat/presentation/commands/get-group-messages.command';
import { LeaveGroupChatRoomCommand } from '@module/chat/presentation/commands/leave-group-chat-room.command';
import { CreateVoteCommand } from '@module/chat/presentation/commands/create-vote.command';
import { GetVoteDetailCommand } from '@module/chat/presentation/commands/get-vote-detail.command';
import { AnswerVoteCommand } from '@module/chat/presentation/commands/answer-vote.command';
import { CloseVoteCommand } from '@module/chat/presentation/commands/close-vote.command';
import { AddVoteOptionCommand } from '@module/chat/presentation/commands/add-vote-option.command';
import { SearchPlacesCommand } from '@module/chat/presentation/commands/search-places.command';

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

    @Get('rooms/:roomId')
    @ApiOperation({
        summary: '채팅방 상세 조회',
        description: '채팅방 상세 정보 (파트너 프로필, 만료 시각 등)를 조회합니다. 참여자만 조회 가능합니다.',
    })
    @ApiParam({ name: 'roomId', description: '채팅방 ID' })
    @ApiCommandResponse(200, '채팅방 상세 조회 성공', ChatRoomDetailDto)
    async getChatRoomDetail(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
    ): Promise<ICommandResult<ChatRoomDetailDto>> {
        const command = new GetChatRoomDetailCommand(user.id, roomId);
        return await this.commandBus.execute<ChatRoomDetailDto>(command);
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

    @Post('rooms/:roomId/leave')
    @ApiOperation({
        summary: '채팅방 나가기',
        description: '채팅방을 나갑니다. 나간 후에는 재입장할 수 없습니다.',
    })
    @ApiParam({ name: 'roomId', description: '채팅방 ID' })
    @ApiCommandResponse(200, '채팅방 나가기 성공')
    async leaveChatRoom(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
        @Body() dto: LeaveChatRoomDto,
    ): Promise<ICommandResult<void>> {
        const command = new LeaveChatRoomCommand(user.id, roomId, dto.reason);
        return await this.commandBus.execute<void>(command);
    }

    // ─── Group Chat Endpoints ─────────────────────────────────────────────────

    @Get('group-rooms/:roomId')
    @ApiOperation({
        summary: '그룹 채팅방 상세 조회',
        description: '그룹 채팅방 상세 정보 (멤버 목록, 만료 시각 등)를 조회합니다. 참여자만 조회 가능합니다.',
    })
    @ApiParam({ name: 'roomId', description: '그룹 채팅방 ID' })
    @ApiCommandResponse(200, '그룹 채팅방 상세 조회 성공', GroupChatRoomDetailDto)
    async getGroupRoomDetail(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
    ): Promise<ICommandResult<GroupChatRoomDetailDto>> {
        const command = new GetGroupRoomDetailCommand(user.id, roomId);
        return await this.commandBus.execute<GroupChatRoomDetailDto>(command);
    }

    @Get('group-rooms/:roomId/messages')
    @ApiOperation({
        summary: '그룹 채팅 메시지 목록 조회',
        description: '그룹 채팅방의 메시지를 커서 기반 페이지네이션으로 조회합니다. 각 메시지에 발신자 정보와 unreadCount가 포함됩니다.',
    })
    @ApiParam({ name: 'roomId', description: '그룹 채팅방 ID' })
    @ApiQuery({ name: 'cursor', required: false, description: '페이지 커서 (이전 응답의 nextCursor)' })
    @ApiQuery({ name: 'limit', required: false, description: '조회 건수 (기본 30)', type: Number })
    @ApiCommandResponse(200, '메시지 조회 성공', GroupMessageListDto)
    async getGroupMessages(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
        @Query('cursor') cursor?: string,
        @Query('limit') limit?: string,
    ): Promise<ICommandResult<GroupMessageListDto>> {
        const command = new GetGroupMessagesCommand(
            user.id, roomId, cursor, limit ? parseInt(limit, 10) : undefined,
        );
        return await this.commandBus.execute<GroupMessageListDto>(command);
    }

    @Post('group-rooms/:roomId/messages')
    @ApiOperation({
        summary: '그룹 채팅 메시지 전송',
        description: '그룹 채팅방에 메시지를 전송합니다. 참여자만 전송 가능합니다.',
    })
    @ApiParam({ name: 'roomId', description: '그룹 채팅방 ID' })
    @ApiCommandResponse(201, '메시지 전송 성공', ChatMessageDto)
    async sendGroupMessage(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
        @Body() dto: SendMessageDto,
    ): Promise<ICommandResult<ChatMessageDto>> {
        const command = new SendMessageCommand(user.id, roomId, dto);
        return await this.commandBus.execute<ChatMessageDto>(command);
    }

    @Patch('group-rooms/:roomId/read')
    @ApiOperation({
        summary: '그룹 채팅 읽음 처리',
        description: '그룹 채팅방의 메시지를 현재 시각까지 읽음 처리합니다.',
    })
    @ApiParam({ name: 'roomId', description: '그룹 채팅방 ID' })
    @ApiCommandResponse(200, '읽음 처리 성공')
    async markGroupAsRead(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
    ): Promise<ICommandResult<void>> {
        const command = new MarkAsReadCommand(user.id, roomId);
        return await this.commandBus.execute<void>(command);
    }

    @Post('group-rooms/:roomId/leave')
    @ApiOperation({
        summary: '그룹 채팅방 나가기',
        description: '그룹 채팅방을 나갑니다. 마지막 멤버가 나가면 방이 종료됩니다.',
    })
    @ApiParam({ name: 'roomId', description: '그룹 채팅방 ID' })
    @ApiCommandResponse(200, '그룹 채팅방 나가기 성공')
    async leaveGroupChatRoom(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
        @Body() _dto: LeaveGroupChatRoomDto,
    ): Promise<ICommandResult<void>> {
        const command = new LeaveGroupChatRoomCommand(user.id, roomId);
        return await this.commandBus.execute<void>(command);
    }

    // ─── Vote Endpoints ───────────────────────────────────────────────────────

    @Get('votes/place-search')
    @ApiOperation({
        summary: '카카오 장소 검색',
        description: '카카오 Local API를 통해 키워드 기반 장소를 검색합니다.',
    })
    @ApiQuery({ name: 'query', required: true, description: '검색어' })
    @ApiQuery({ name: 'size', required: false, description: '조회 건수 (기본 15, 최대 15)', type: Number })
    @ApiCommandResponse(200, '카카오 장소 검색 성공', KakaoPlaceSearchResultDto, true)
    async searchPlaces(
        @CurrentUser() user: User,
        @Query('query') query: string,
        @Query('size') size?: string,
    ): Promise<ICommandResult<KakaoPlaceSearchResultDto[]>> {
        const parsedSize = size ? parseInt(size, 10) : undefined;
        const command = new SearchPlacesCommand(query, user.id, Number.isNaN(parsedSize) ? undefined : parsedSize);
        return await this.commandBus.execute<KakaoPlaceSearchResultDto[]>(command);
    }

    @Post('group-rooms/:roomId/votes')
    @ApiOperation({
        summary: '투표 생성',
        description: '그룹 채팅방에 투표를 생성합니다. 방당 활성 투표는 1개로 제한됩니다.',
    })
    @ApiParam({ name: 'roomId', description: '그룹 채팅방 ID' })
    @ApiCommandResponse(201, '투표 생성 성공', GroupVoteDto)
    async createVote(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
        @Body() dto: CreateVoteDto,
    ): Promise<ICommandResult<GroupVoteDto>> {
        const command = new CreateVoteCommand(user.id, roomId, dto);
        return await this.commandBus.execute<GroupVoteDto>(command);
    }

    @Get('group-rooms/:roomId/votes/:voteId')
    @ApiOperation({
        summary: '투표 상세 조회',
        description: '투표 상세 정보와 각 옵션의 투표 현황을 조회합니다.',
    })
    @ApiParam({ name: 'roomId', description: '그룹 채팅방 ID' })
    @ApiParam({ name: 'voteId', description: '투표 ID' })
    @ApiCommandResponse(200, '투표 조회 성공', GroupVoteDto)
    async getVoteDetail(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
        @Param('voteId') voteId: string,
    ): Promise<ICommandResult<GroupVoteDto>> {
        const command = new GetVoteDetailCommand(user.id, roomId, voteId);
        return await this.commandBus.execute<GroupVoteDto>(command);
    }

    @Post('group-rooms/:roomId/votes/:voteId/cast')
    @ApiOperation({
        summary: '투표 참여 (선택/변경/취소)',
        description: '투표에 참여하거나 기존 선택을 변경합니다. 빈 배열을 보내면 해당 타입 투표 취소입니다.',
    })
    @ApiParam({ name: 'roomId', description: '그룹 채팅방 ID' })
    @ApiParam({ name: 'voteId', description: '투표 ID' })
    @ApiCommandResponse(200, '투표 참여 성공', GroupVoteDto)
    async castVote(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
        @Param('voteId') voteId: string,
        @Body() dto: CastVoteDto,
    ): Promise<ICommandResult<GroupVoteDto>> {
        const command = new AnswerVoteCommand(user.id, roomId, voteId, dto);
        return await this.commandBus.execute<GroupVoteDto>(command);
    }

    @Post('group-rooms/:roomId/votes/:voteId/options')
    @ApiOperation({
        summary: '투표 옵션 추가',
        description: '진행 중인 투표에 장소 또는 시간 옵션을 추가합니다.',
    })
    @ApiParam({ name: 'roomId', description: '그룹 채팅방 ID' })
    @ApiParam({ name: 'voteId', description: '투표 ID' })
    @ApiCommandResponse(201, '옵션 추가 성공', GroupVoteDto)
    async addVoteOption(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
        @Param('voteId') voteId: string,
        @Body() dto: AddVoteOptionDto,
    ): Promise<ICommandResult<GroupVoteDto>> {
        const command = new AddVoteOptionCommand(user.id, roomId, voteId, dto);
        return await this.commandBus.execute<GroupVoteDto>(command);
    }

    @Post('group-rooms/:roomId/votes/:voteId/close')
    @ApiOperation({
        summary: '투표 종료',
        description: '진행 중인 투표를 종료합니다. 투표 생성자만 종료할 수 있습니다.',
    })
    @ApiParam({ name: 'roomId', description: '그룹 채팅방 ID' })
    @ApiParam({ name: 'voteId', description: '투표 ID' })
    @ApiCommandResponse(200, '투표 종료 성공')
    async closeVote(
        @CurrentUser() user: User,
        @Param('roomId') roomId: string,
        @Param('voteId') voteId: string,
    ): Promise<ICommandResult<void>> {
        const command = new CloseVoteCommand(user.id, roomId, voteId);
        return await this.commandBus.execute<void>(command);
    }
}
