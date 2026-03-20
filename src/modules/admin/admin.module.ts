import { Module, OnModuleInit } from '@nestjs/common';
import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { CommonModule } from '@module/common/common.module';
import { QuizModule } from '@module/quiz/quiz.module';
import { UserModule } from '@module/user/user.module';
import { MatchingModule } from '@module/matching/matching.module';
import { GetDbStatsUseCase } from './application/usecases/get-db-stats.usecase';
import { GetAllMatchesUseCase } from './application/usecases/get-all-matches.usecase';
import { SetSystemOverrideUseCase } from './application/usecases/set-system-override.usecase';
import { ClearSystemOverrideUseCase } from './application/usecases/clear-system-override.usecase';
import { ResetAllQuizProgressUseCase } from './application/usecases/reset-all-quiz-progress.usecase';
import { GetQuizProgressUseCase } from './application/usecases/get-quiz-progress.usecase';
import { SeedDummyDataUseCase } from './application/usecases/seed-dummy-data.usecase';
import { AdminCreateDummyMatchRequestUseCase } from './application/usecases/admin-create-dummy-match-request.usecase';
import { AdminGetActiveQuizSetsUseCase } from './application/usecases/admin-get-active-quiz-sets.usecase';
import { GetDbStatsHandler } from './presentation/commands/handlers/get-db-stats.handler';
import { GetAllMatchesHandler } from './presentation/commands/handlers/get-all-matches.handler';
import { SetSystemOverrideHandler } from './presentation/commands/handlers/set-system-override.handler';
import { ClearSystemOverrideHandler } from './presentation/commands/handlers/clear-system-override.handler';
import { ResetAllQuizProgressHandler } from './presentation/commands/handlers/reset-all-quiz-progress.handler';
import { GetAdminQuizProgressHandler } from './presentation/commands/handlers/get-admin-quiz-progress.handler';
import { SeedDummyDataHandler } from './presentation/commands/handlers/seed-dummy-data.handler';
import { GetAdminMatchCandidatesHandler } from './presentation/commands/handlers/get-admin-match-candidates.handler';
import { AdminCreateDummyMatchRequestHandler } from './presentation/commands/handlers/admin-create-dummy-match-request.handler';
import { AdminGetActiveQuizSetsHandler } from './presentation/commands/handlers/admin-get-active-quiz-sets.handler';
import { AdminController } from './presentation/controller/admin.controller';

@Module({
  imports: [CommandBusModule, CommonModule, QuizModule, UserModule, MatchingModule],
  controllers: [AdminController],
  providers: [
    GetDbStatsUseCase,
    GetAllMatchesUseCase,
    SetSystemOverrideUseCase,
    ClearSystemOverrideUseCase,
    ResetAllQuizProgressUseCase,
    GetQuizProgressUseCase,
    SeedDummyDataUseCase,
    AdminCreateDummyMatchRequestUseCase,
    AdminGetActiveQuizSetsUseCase,
    GetDbStatsHandler,
    GetAllMatchesHandler,
    SetSystemOverrideHandler,
    ClearSystemOverrideHandler,
    ResetAllQuizProgressHandler,
    GetAdminQuizProgressHandler,
    SeedDummyDataHandler,
    GetAdminMatchCandidatesHandler,
    AdminCreateDummyMatchRequestHandler,
    AdminGetActiveQuizSetsHandler,
  ],
})
export class AdminModule implements OnModuleInit {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly getDbStatsHandler: GetDbStatsHandler,
    private readonly getAllMatchesHandler: GetAllMatchesHandler,
    private readonly setSystemOverrideHandler: SetSystemOverrideHandler,
    private readonly clearSystemOverrideHandler: ClearSystemOverrideHandler,
    private readonly resetAllQuizProgressHandler: ResetAllQuizProgressHandler,
    private readonly getAdminQuizProgressHandler: GetAdminQuizProgressHandler,
    private readonly seedDummyDataHandler: SeedDummyDataHandler,
    private readonly getAdminMatchCandidatesHandler: GetAdminMatchCandidatesHandler,
    private readonly adminCreateDummyMatchRequestHandler: AdminCreateDummyMatchRequestHandler,
    private readonly adminGetActiveQuizSetsHandler: AdminGetActiveQuizSetsHandler,
  ) {}

  onModuleInit(): void {
    registerCommandHandlers(
      this.commandBus,
      [
        { handler: this.getDbStatsHandler, class: GetDbStatsHandler },
        { handler: this.getAllMatchesHandler, class: GetAllMatchesHandler },
        { handler: this.setSystemOverrideHandler, class: SetSystemOverrideHandler },
        { handler: this.clearSystemOverrideHandler, class: ClearSystemOverrideHandler },
        { handler: this.resetAllQuizProgressHandler, class: ResetAllQuizProgressHandler },
        { handler: this.getAdminQuizProgressHandler, class: GetAdminQuizProgressHandler },
        { handler: this.seedDummyDataHandler, class: SeedDummyDataHandler },
        { handler: this.getAdminMatchCandidatesHandler, class: GetAdminMatchCandidatesHandler },
        { handler: this.adminCreateDummyMatchRequestHandler, class: AdminCreateDummyMatchRequestHandler },
        { handler: this.adminGetActiveQuizSetsHandler, class: AdminGetActiveQuizSetsHandler },
      ],
      'AdminModule',
    );
  }
}
