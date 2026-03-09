import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { UserModule } from '@module/user/user.module';

// Repository
import { UserProfileRepository } from '@module/profile/infrastructure/repository/user-profile.repository';
import { USER_PROFILE_REPOSITORY_TOKEN } from '@module/profile/infrastructure/repository/user-profile.repository.interface';
import { UserIntroNoteRepository } from '@module/profile/infrastructure/repository/user-intro-note.repository';
import { USER_INTRO_NOTE_REPOSITORY_TOKEN } from '@module/profile/infrastructure/repository/user-intro-note.repository.interface';

// Controller
import { ProfileController } from '@module/profile/presentation/controller/profile.controller';

// UseCases
import { GetMyProfileUseCase } from '@module/profile/application/usecases/get-my-profile.usecase';
import { UpdateMyProfileUseCase } from '@module/profile/application/usecases/update-my-profile.usecase';
import { GetUserProfileUseCase } from '@module/profile/application/usecases/get-user-profile.usecase';
import { GetIntroNotesUseCase } from '@module/profile/application/usecases/get-intro-notes.usecase';
import { UpdateIntroNotesUseCase } from '@module/profile/application/usecases/update-intro-notes.usecase';

// Handlers
import { GetMyProfileHandler } from '@module/profile/presentation/commands/handlers/get-my-profile.handler';
import { UpdateMyProfileHandler } from '@module/profile/presentation/commands/handlers/update-my-profile.handler';
import { GetUserProfileHandler } from '@module/profile/presentation/commands/handlers/get-user-profile.handler';
import { GetIntroNotesHandler } from '@module/profile/presentation/commands/handlers/get-intro-notes.handler';
import { UpdateIntroNotesHandler } from '@module/profile/presentation/commands/handlers/update-intro-notes.handler';

const UserProfileRepositoryProvider = {
    provide: USER_PROFILE_REPOSITORY_TOKEN,
    useClass: UserProfileRepository,
};

const UserIntroNoteRepositoryProvider = {
    provide: USER_INTRO_NOTE_REPOSITORY_TOKEN,
    useClass: UserIntroNoteRepository,
};

@Module({
    imports: [
        CommandBusModule,
        forwardRef(() => UserModule),
    ],
    controllers: [ProfileController],
    providers: [
        // Repositories
        UserProfileRepositoryProvider,
        UserIntroNoteRepositoryProvider,

        // UseCases
        GetMyProfileUseCase,
        UpdateMyProfileUseCase,
        GetUserProfileUseCase,
        GetIntroNotesUseCase,
        UpdateIntroNotesUseCase,

        // Handlers
        GetMyProfileHandler,
        UpdateMyProfileHandler,
        GetUserProfileHandler,
        GetIntroNotesHandler,
        UpdateIntroNotesHandler,
    ],
    exports: [USER_PROFILE_REPOSITORY_TOKEN],
})
export class ProfileModule implements OnModuleInit {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly getMyProfileHandler: GetMyProfileHandler,
        private readonly updateMyProfileHandler: UpdateMyProfileHandler,
        private readonly getUserProfileHandler: GetUserProfileHandler,
        private readonly getIntroNotesHandler: GetIntroNotesHandler,
        private readonly updateIntroNotesHandler: UpdateIntroNotesHandler,
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
                { handler: this.getIntroNotesHandler, class: GetIntroNotesHandler },
                { handler: this.updateIntroNotesHandler, class: UpdateIntroNotesHandler },
            ],
            'ProfileModule',
        );
    }
}
