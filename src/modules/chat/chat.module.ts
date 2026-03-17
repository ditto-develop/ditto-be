import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { UserModule } from '@module/user/user.module';
import { MatchingModule } from '@module/matching/matching.module';

// Repository
import { ChatRepository } from '@module/chat/infrastructure/repository/chat.repository';
import { CHAT_REPOSITORY_TOKEN } from '@module/chat/infrastructure/repository/chat.repository.interface';

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

// Handlers
import { GetChatRoomsHandler } from '@module/chat/presentation/commands/handlers/get-chat-rooms.handler';
import { CreateChatRoomHandler } from '@module/chat/presentation/commands/handlers/create-chat-room.handler';
import { GetMessagesHandler } from '@module/chat/presentation/commands/handlers/get-messages.handler';
import { SendMessageHandler } from '@module/chat/presentation/commands/handlers/send-message.handler';
import { MarkAsReadHandler } from '@module/chat/presentation/commands/handlers/mark-as-read.handler';
import { GetChatRoomDetailHandler } from '@module/chat/presentation/commands/handlers/get-chat-room-detail.handler';
import { LeaveChatRoomHandler } from '@module/chat/presentation/commands/handlers/leave-chat-room.handler';

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

        // UseCases
        GetChatRoomsUseCase,
        CreateChatRoomUseCase,
        GetMessagesUseCase,
        SendMessageUseCase,
        MarkAsReadUseCase,
        GetChatRoomDetailUseCase,
        LeaveChatRoomUseCase,

        // Handlers
        GetChatRoomsHandler,
        CreateChatRoomHandler,
        GetMessagesHandler,
        SendMessageHandler,
        MarkAsReadHandler,
        GetChatRoomDetailHandler,
        LeaveChatRoomHandler,
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
            ],
            'ChatModule',
        );
    }
}
