import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { UserModule } from '@module/user/user.module';
import { MatchingModule } from '@module/matching/matching.module';

// Repository
import { ChatRepository } from '@module/chat/infrastructure/repository/chat.repository';
import { CHAT_REPOSITORY_TOKEN } from '@module/chat/infrastructure/repository/chat.repository.interface';
import { KakaoLocalService } from '@module/chat/infrastructure/external/kakao-local.service';

// Controller
import { ChatController } from '@module/chat/presentation/controller/chat.controller';

// UseCases
import { GetChatRoomsUseCase } from '@module/chat/application/usecases/get-chat-rooms.usecase';
import { CreateChatRoomUseCase } from '@module/chat/application/usecases/create-chat-room.usecase';
import { GetMessagesUseCase } from '@module/chat/application/usecases/get-messages.usecase';
import { SendMessageUseCase } from '@module/chat/application/usecases/send-message.usecase';
import { MarkAsReadUseCase } from '@module/chat/application/usecases/mark-as-read.usecase';
import { GetChatRoomDetailUseCase } from '@module/chat/application/usecases/get-chat-room-detail.usecase';
import { LeaveChatRoomUseCase } from '@module/chat/application/usecases/leave-chat-room.usecase';
import { GetGroupRoomDetailUseCase } from '@module/chat/application/usecases/get-group-room-detail.usecase';
import { GetGroupMessagesUseCase } from '@module/chat/application/usecases/get-group-messages.usecase';
import { LeaveGroupChatRoomUseCase } from '@module/chat/application/usecases/leave-group-chat-room.usecase';
import { CreateVoteUseCase } from '@module/chat/application/usecases/create-vote.usecase';
import { GetVoteDetailUseCase } from '@module/chat/application/usecases/get-vote-detail.usecase';
import { AnswerVoteUseCase } from '@module/chat/application/usecases/answer-vote.usecase';
import { CloseVoteUseCase } from '@module/chat/application/usecases/close-vote.usecase';
import { AddVoteOptionUseCase } from '@module/chat/application/usecases/add-vote-option.usecase';
import { SearchPlacesUseCase } from '@module/chat/application/usecases/search-places.usecase';

// Handlers
import { GetChatRoomsHandler } from '@module/chat/presentation/commands/handlers/get-chat-rooms.handler';
import { CreateChatRoomHandler } from '@module/chat/presentation/commands/handlers/create-chat-room.handler';
import { GetMessagesHandler } from '@module/chat/presentation/commands/handlers/get-messages.handler';
import { SendMessageHandler } from '@module/chat/presentation/commands/handlers/send-message.handler';
import { MarkAsReadHandler } from '@module/chat/presentation/commands/handlers/mark-as-read.handler';
import { GetChatRoomDetailHandler } from '@module/chat/presentation/commands/handlers/get-chat-room-detail.handler';
import { LeaveChatRoomHandler } from '@module/chat/presentation/commands/handlers/leave-chat-room.handler';
import { GetGroupRoomDetailHandler } from '@module/chat/presentation/commands/handlers/get-group-room-detail.handler';
import { GetGroupMessagesHandler } from '@module/chat/presentation/commands/handlers/get-group-messages.handler';
import { LeaveGroupChatRoomHandler } from '@module/chat/presentation/commands/handlers/leave-group-chat-room.handler';
import { CreateVoteHandler } from '@module/chat/presentation/commands/handlers/create-vote.handler';
import { GetVoteDetailHandler } from '@module/chat/presentation/commands/handlers/get-vote-detail.handler';
import { AnswerVoteHandler } from '@module/chat/presentation/commands/handlers/answer-vote.handler';
import { CloseVoteHandler } from '@module/chat/presentation/commands/handlers/close-vote.handler';
import { AddVoteOptionHandler } from '@module/chat/presentation/commands/handlers/add-vote-option.handler';
import { SearchPlacesHandler } from '@module/chat/presentation/commands/handlers/search-places.handler';

const ChatRepositoryProvider = {
    provide: CHAT_REPOSITORY_TOKEN,
    useClass: ChatRepository,
};

@Module({
    imports: [
        CommandBusModule,
        forwardRef(() => UserModule),
        forwardRef(() => MatchingModule),
    ],
    controllers: [ChatController],
    providers: [
        // Repository
        ChatRepositoryProvider,
        KakaoLocalService,

        // UseCases
        GetChatRoomsUseCase,
        CreateChatRoomUseCase,
        GetMessagesUseCase,
        SendMessageUseCase,
        MarkAsReadUseCase,
        GetChatRoomDetailUseCase,
        LeaveChatRoomUseCase,
        GetGroupRoomDetailUseCase,
        GetGroupMessagesUseCase,
        LeaveGroupChatRoomUseCase,
        CreateVoteUseCase,
        GetVoteDetailUseCase,
        AnswerVoteUseCase,
        CloseVoteUseCase,
        AddVoteOptionUseCase,
        SearchPlacesUseCase,

        // Handlers
        GetChatRoomsHandler,
        CreateChatRoomHandler,
        GetMessagesHandler,
        SendMessageHandler,
        MarkAsReadHandler,
        GetChatRoomDetailHandler,
        LeaveChatRoomHandler,
        GetGroupRoomDetailHandler,
        GetGroupMessagesHandler,
        LeaveGroupChatRoomHandler,
        CreateVoteHandler,
        GetVoteDetailHandler,
        AnswerVoteHandler,
        CloseVoteHandler,
        AddVoteOptionHandler,
        SearchPlacesHandler,
    ],
    exports: [CHAT_REPOSITORY_TOKEN],
})
export class ChatModule implements OnModuleInit {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly getChatRoomsHandler: GetChatRoomsHandler,
        private readonly createChatRoomHandler: CreateChatRoomHandler,
        private readonly getMessagesHandler: GetMessagesHandler,
        private readonly sendMessageHandler: SendMessageHandler,
        private readonly markAsReadHandler: MarkAsReadHandler,
        private readonly getChatRoomDetailHandler: GetChatRoomDetailHandler,
        private readonly leaveChatRoomHandler: LeaveChatRoomHandler,
        private readonly getGroupRoomDetailHandler: GetGroupRoomDetailHandler,
        private readonly getGroupMessagesHandler: GetGroupMessagesHandler,
        private readonly leaveGroupChatRoomHandler: LeaveGroupChatRoomHandler,
        private readonly createVoteHandler: CreateVoteHandler,
        private readonly getVoteDetailHandler: GetVoteDetailHandler,
        private readonly answerVoteHandler: AnswerVoteHandler,
        private readonly closeVoteHandler: CloseVoteHandler,
        private readonly addVoteOptionHandler: AddVoteOptionHandler,
        private readonly searchPlacesHandler: SearchPlacesHandler,
    ) {
        console.log('[ChatModule] 초기화');
    }

    onModuleInit(): void {
        registerCommandHandlers(
            this.commandBus,
            [
                { handler: this.getChatRoomsHandler, class: GetChatRoomsHandler },
                { handler: this.createChatRoomHandler, class: CreateChatRoomHandler },
                { handler: this.getMessagesHandler, class: GetMessagesHandler },
                { handler: this.sendMessageHandler, class: SendMessageHandler },
                { handler: this.markAsReadHandler, class: MarkAsReadHandler },
                { handler: this.getChatRoomDetailHandler, class: GetChatRoomDetailHandler },
                { handler: this.leaveChatRoomHandler, class: LeaveChatRoomHandler },
                { handler: this.getGroupRoomDetailHandler, class: GetGroupRoomDetailHandler },
                { handler: this.getGroupMessagesHandler, class: GetGroupMessagesHandler },
                { handler: this.leaveGroupChatRoomHandler, class: LeaveGroupChatRoomHandler },
                { handler: this.createVoteHandler, class: CreateVoteHandler },
                { handler: this.getVoteDetailHandler, class: GetVoteDetailHandler },
                { handler: this.answerVoteHandler, class: AnswerVoteHandler },
                { handler: this.closeVoteHandler, class: CloseVoteHandler },
                { handler: this.addVoteOptionHandler, class: AddVoteOptionHandler },
                { handler: this.searchPlacesHandler, class: SearchPlacesHandler },
            ],
            'ChatModule',
        );
    }
}
