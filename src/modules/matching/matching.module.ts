import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { UserModule } from '@module/user/user.module';
import { ProfileModule } from '@module/profile/profile.module';
import { ChatModule } from '@module/chat/chat.module';

// Repository
import { MatchRequestRepository } from '@module/matching/infrastructure/repository/match-request.repository';
import { MATCH_REQUEST_REPOSITORY_TOKEN } from '@module/matching/infrastructure/repository/match-request.repository.interface';

// Services
import { MatchingScoreService } from '@module/matching/domain/services/matching-score.service';

// Controller
import { MatchingController } from '@module/matching/presentation/controller/matching.controller';

// UseCases
import { GetMatchCandidatesUseCase } from '@module/matching/application/usecases/get-match-candidates.usecase';
import { SendMatchRequestUseCase } from '@module/matching/application/usecases/send-match-request.usecase';
import { AcceptMatchRequestUseCase } from '@module/matching/application/usecases/accept-match-request.usecase';
import { RejectMatchRequestUseCase } from '@module/matching/application/usecases/reject-match-request.usecase';
import { GetMatchingStatusUseCase } from '@module/matching/application/usecases/get-matching-status.usecase';

// Handlers
import { GetMatchCandidatesHandler } from '@module/matching/presentation/commands/handlers/get-match-candidates.handler';
import { SendMatchRequestHandler } from '@module/matching/presentation/commands/handlers/send-match-request.handler';
import { AcceptMatchRequestHandler } from '@module/matching/presentation/commands/handlers/accept-match-request.handler';
import { RejectMatchRequestHandler } from '@module/matching/presentation/commands/handlers/reject-match-request.handler';
import { GetMatchingStatusHandler } from '@module/matching/presentation/commands/handlers/get-matching-status.handler';

const MatchRequestRepositoryProvider = {
    provide: MATCH_REQUEST_REPOSITORY_TOKEN,
    useClass: MatchRequestRepository,
};

@Module({
    imports: [
        CommandBusModule,
        forwardRef(() => UserModule),
        forwardRef(() => ProfileModule),
        forwardRef(() => ChatModule),
    ],
    controllers: [MatchingController],
    providers: [
        // Repository
        MatchRequestRepositoryProvider,

        // Services
        MatchingScoreService,

        // UseCases
        GetMatchCandidatesUseCase,
        SendMatchRequestUseCase,
        AcceptMatchRequestUseCase,
        RejectMatchRequestUseCase,
        GetMatchingStatusUseCase,

        // Handlers
        GetMatchCandidatesHandler,
        SendMatchRequestHandler,
        AcceptMatchRequestHandler,
        RejectMatchRequestHandler,
        GetMatchingStatusHandler,
    ],
    exports: [MATCH_REQUEST_REPOSITORY_TOKEN, MatchingScoreService],
})
export class MatchingModule implements OnModuleInit {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly getMatchCandidatesHandler: GetMatchCandidatesHandler,
        private readonly sendMatchRequestHandler: SendMatchRequestHandler,
        private readonly acceptMatchRequestHandler: AcceptMatchRequestHandler,
        private readonly rejectMatchRequestHandler: RejectMatchRequestHandler,
        private readonly getMatchingStatusHandler: GetMatchingStatusHandler,
    ) {
        console.log('[MatchingModule] 초기화');
    }

    onModuleInit(): void {
        registerCommandHandlers(
            this.commandBus,
            [
                { handler: this.getMatchCandidatesHandler, class: GetMatchCandidatesHandler },
                { handler: this.sendMatchRequestHandler, class: SendMatchRequestHandler },
                { handler: this.acceptMatchRequestHandler, class: AcceptMatchRequestHandler },
                { handler: this.rejectMatchRequestHandler, class: RejectMatchRequestHandler },
                { handler: this.getMatchingStatusHandler, class: GetMatchingStatusHandler },
            ],
            'MatchingModule',
        );
    }
}
