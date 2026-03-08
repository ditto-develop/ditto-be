import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { UserModule } from '@module/user/user.module';
import { MatchingModule } from '@module/matching/matching.module';

// Repository
import { RatingRepository } from '@module/rating/infrastructure/repository/rating.repository';
import { RATING_REPOSITORY_TOKEN } from '@module/rating/infrastructure/repository/rating.repository.interface';

// Services
import { RatingPolicyService } from '@module/rating/domain/services/rating-policy.service';

// Controller
import { RatingController } from '@module/rating/presentation/controller/rating.controller';

// UseCases
import { GetUserAnswersUseCase } from '@module/rating/application/usecases/get-user-answers.usecase';
import { CreateRatingUseCase } from '@module/rating/application/usecases/create-rating.usecase';
import { GetUserRatingsUseCase } from '@module/rating/application/usecases/get-user-ratings.usecase';

// Handlers
import { GetUserAnswersHandler } from '@module/rating/presentation/commands/handlers/get-user-answers.handler';
import { CreateRatingHandler } from '@module/rating/presentation/commands/handlers/create-rating.handler';
import { GetUserRatingsHandler } from '@module/rating/presentation/commands/handlers/get-user-ratings.handler';

const RatingRepositoryProvider = {
    provide: RATING_REPOSITORY_TOKEN,
    useClass: RatingRepository,
};

@Module({
    imports: [
        CommandBusModule,
        forwardRef(() => UserModule),
        forwardRef(() => MatchingModule),
    ],
    controllers: [RatingController],
    providers: [
        RatingRepositoryProvider,
        RatingPolicyService,

        GetUserAnswersUseCase,
        CreateRatingUseCase,
        GetUserRatingsUseCase,

        GetUserAnswersHandler,
        CreateRatingHandler,
        GetUserRatingsHandler,
    ],
    exports: [RATING_REPOSITORY_TOKEN, RatingPolicyService],
})
export class RatingModule implements OnModuleInit {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly getUserAnswersHandler: GetUserAnswersHandler,
        private readonly createRatingHandler: CreateRatingHandler,
        private readonly getUserRatingsHandler: GetUserRatingsHandler,
    ) {
        console.log('[RatingModule] 초기화');
    }

    onModuleInit(): void {
        registerCommandHandlers(
            this.commandBus,
            [
                { handler: this.getUserAnswersHandler, class: GetUserAnswersHandler },
                { handler: this.createRatingHandler, class: CreateRatingHandler },
                { handler: this.getUserRatingsHandler, class: GetUserRatingsHandler },
            ],
            'RatingModule',
        );
    }
}
