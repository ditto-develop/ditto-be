import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { UserModule } from '@module/user/user.module';

// Repository
import { UserProfileRepository } from '@module/profile/infrastructure/repository/user-profile.repository';
import { USER_PROFILE_REPOSITORY_TOKEN } from '@module/profile/infrastructure/repository/user-profile.repository.interface';

// Controller
import { ProfileController } from '@module/profile/presentation/controller/profile.controller';

// UseCases
import { GetMyProfileUseCase } from '@module/profile/application/usecases/get-my-profile.usecase';
import { UpdateMyProfileUseCase } from '@module/profile/application/usecases/update-my-profile.usecase';
import { GetUserProfileUseCase } from '@module/profile/application/usecases/get-user-profile.usecase';

// Handlers
import { GetMyProfileHandler } from '@module/profile/presentation/commands/handlers/get-my-profile.handler';
import { UpdateMyProfileHandler } from '@module/profile/presentation/commands/handlers/update-my-profile.handler';
import { GetUserProfileHandler } from '@module/profile/presentation/commands/handlers/get-user-profile.handler';

const UserProfileRepositoryProvider = {
    provide: USER_PROFILE_REPOSITORY_TOKEN,
    useClass: UserProfileRepository,
};

@Module({
    imports: [
        CommandBusModule,
        forwardRef(() => UserModule),
    ],
    controllers: [ProfileController],
    providers: [
        // Repository
        UserProfileRepositoryProvider,

        // UseCases
        GetMyProfileUseCase,
        UpdateMyProfileUseCase,
        GetUserProfileUseCase,

        // Handlers
        GetMyProfileHandler,
        UpdateMyProfileHandler,
        GetUserProfileHandler,
    ],
    exports: [USER_PROFILE_REPOSITORY_TOKEN],
})
export class ProfileModule implements OnModuleInit {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly getMyProfileHandler: GetMyProfileHandler,
        private readonly updateMyProfileHandler: UpdateMyProfileHandler,
        private readonly getUserProfileHandler: GetUserProfileHandler,
    ) {
        console.log('[ProfileModule] 초기화');
    }

    onModuleInit(): void {
        registerCommandHandlers(
            this.commandBus,
            [
                { handler: this.getMyProfileHandler, class: GetMyProfileHandler },
                { handler: this.updateMyProfileHandler, class: UpdateMyProfileHandler },
                { handler: this.getUserProfileHandler, class: GetUserProfileHandler },
            ],
            'ProfileModule',
        );
    }
}
