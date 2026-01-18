import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { CommonModule } from '@module/common/common.module';
import { RedisModule } from '@module/common/redis/redis.module';
import { UserModule } from '@module/user/user.module';
import { ActivateQuizSetUseCase } from '@module/quiz/application/usecases/activate-quiz-set.usecase';
import { CreateQuizSetUseCase } from '@module/quiz/application/usecases/create-quiz-set.usecase';
import { CreateQuizUseCase } from '@module/quiz/application/usecases/create-quiz.usecase';
import { DeactivateQuizSetUseCase } from '@module/quiz/application/usecases/deactivate-quiz-set.usecase';
import { DeleteQuizSetUseCase } from '@module/quiz/application/usecases/delete-quiz-set.usecase';
import { DeleteQuizUseCase } from '@module/quiz/application/usecases/delete-quiz.usecase';
import { GetQuizSetsUseCase } from '@module/quiz/application/usecases/get-quiz-sets.usecase';
import { GetQuizUseCase } from '@module/quiz/application/usecases/get-quiz.usecase';
import { GetAllQuizzesUseCase } from '@module/quiz/application/usecases/get-all-quizzes.usecase';
import { GetQuizzesBySetUseCase } from '@module/quiz/application/usecases/get-quizzes-by-set.usecase';
import { GetQuizSetUseCase } from '@module/quiz/application/usecases/get-quiz-set.usecase';
import { GetCurrentWeekQuizSetsUseCase } from '@module/quiz/application/usecases/get-current-week-quiz-sets.usecase';
import { UpdateQuizSetUseCase } from '@module/quiz/application/usecases/update-quiz-set.usecase';
import { UpdateQuizUseCase } from '@module/quiz/application/usecases/update-quiz.usecase';
import { SubmitQuizAnswerUseCase } from '@module/quiz/application/usecases/submit-quiz-answer.usecase';
import { GetQuizProgressUseCase } from '@module/quiz/application/usecases/get-quiz-progress.usecase';
import { ResetWeekProgressUseCase } from '@module/quiz/application/usecases/reset-week-progress.usecase';
import { GetQuizSetWithProgressUseCase } from '@module/quiz/application/usecases/get-quiz-set-with-progress.usecase';
import { ReorderQuizzesUseCase } from '@module/quiz/application/usecases/reorder-quizzes.usecase';
import { QuizSetRepository } from '@module/quiz/infrastructure/repository/quiz-set.repository';
import { QUIZ_SET_REPOSITORY_TOKEN } from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { QuizRepository } from '@module/quiz/infrastructure/repository/quiz.repository';
import { QUIZ_REPOSITORY_TOKEN } from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { UserQuizProgressRepository } from '@module/quiz/infrastructure/repository/user-quiz-progress.repository';
import { USER_QUIZ_PROGRESS_REPOSITORY_TOKEN } from '@module/quiz/infrastructure/repository/user-quiz-progress.repository.interface';
import { QuizAnswerRepository } from '@module/quiz/infrastructure/repository/quiz-answer.repository';
import { QUIZ_ANSWER_REPOSITORY_TOKEN } from '@module/quiz/infrastructure/repository/quiz-answer.repository.interface';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import { ActivateQuizSetHandler } from '@module/quiz/presentation/commands/handlers/activate-quiz-set.handler';
import { CreateQuizSetHandler } from '@module/quiz/presentation/commands/handlers/create-quiz-set.handler';
import { CreateQuizHandler } from '@module/quiz/presentation/commands/handlers/create-quiz.handler';
import { DeactivateQuizSetHandler } from '@module/quiz/presentation/commands/handlers/deactivate-quiz-set.handler';
import { DeleteQuizHandler } from '@module/quiz/presentation/commands/handlers/delete-quiz.handler';
import { DeleteQuizSetHandler } from '@module/quiz/presentation/commands/handlers/delete-quiz-set.handler';
import { GetQuizHandler } from '@module/quiz/presentation/commands/handlers/get-quiz.handler';
import { GetAllQuizzesHandler } from '@module/quiz/presentation/commands/handlers/get-all-quizzes.handler';
import { GetQuizSetHandler } from '@module/quiz/presentation/commands/handlers/get-quiz-set.handler';
import { GetCurrentWeekQuizSetsHandler } from '@module/quiz/presentation/commands/handlers/get-current-week-quiz-sets.handler';
import { GetQuizSetsHandler } from '@module/quiz/presentation/commands/handlers/get-quiz-sets.handler';
import { GetQuizzesBySetHandler } from '@module/quiz/presentation/commands/handlers/get-quizzes-by-set.handler';
import { UpdateQuizHandler } from '@module/quiz/presentation/commands/handlers/update-quiz.handler';
import { UpdateQuizSetHandler } from '@module/quiz/presentation/commands/handlers/update-quiz-set.handler';
import { SubmitQuizAnswerHandler } from '@module/quiz/presentation/commands/handlers/submit-quiz-answer.handler';
import { GetQuizProgressHandler } from '@module/quiz/presentation/commands/handlers/get-quiz-progress.handler';
import { ResetWeekProgressHandler } from '@module/quiz/presentation/commands/handlers/reset-week-progress.handler';
import { GetQuizSetWithProgressHandler } from '@module/quiz/presentation/commands/handlers/get-quiz-set-with-progress.handler';
import { ReorderQuizzesHandler } from '@module/quiz/presentation/commands/handlers/reorder-quizzes.handler';
import { QuizSetController } from '@module/quiz/presentation/controller/quiz-set.controller';
import { QuizController } from '@module/quiz/presentation/controller/quiz.controller';
import { QuizProgressController } from '@module/quiz/presentation/controller/quiz-progress.controller';
import { SystemStateScheduler } from '@module/quiz/infrastructure/schedulers/system-state.scheduler';
import { Module, OnModuleInit } from '@nestjs/common';

const QuizRepositoryProvider = {
  provide: QUIZ_REPOSITORY_TOKEN,
  useClass: QuizRepository,
};

const QuizSetRepositoryProvider = {
  provide: QUIZ_SET_REPOSITORY_TOKEN,
  useClass: QuizSetRepository,
};

const UserQuizProgressRepositoryProvider = {
  provide: USER_QUIZ_PROGRESS_REPOSITORY_TOKEN,
  useClass: UserQuizProgressRepository,
};

const QuizAnswerRepositoryProvider = {
  provide: QUIZ_ANSWER_REPOSITORY_TOKEN,
  useClass: QuizAnswerRepository,
};

@Module({
  imports: [CommandBusModule, CommonModule, RedisModule, UserModule],
  controllers: [QuizController, QuizSetController, QuizProgressController],
  providers: [
    // Repositories
    QuizRepositoryProvider,
    QuizSetRepositoryProvider,
    UserQuizProgressRepositoryProvider,
    QuizAnswerRepositoryProvider,

    // Services
    SystemStateService,

    // Schedulers
    SystemStateScheduler,

    // UseCases
    CreateQuizUseCase,
    GetQuizUseCase,
    GetAllQuizzesUseCase,
    GetQuizzesBySetUseCase,
    UpdateQuizUseCase,
    DeleteQuizUseCase,
    CreateQuizSetUseCase,
    UpdateQuizSetUseCase,
    DeleteQuizSetUseCase,
    ActivateQuizSetUseCase,
    DeactivateQuizSetUseCase,
    GetQuizSetsUseCase,
    GetQuizSetUseCase,
    GetCurrentWeekQuizSetsUseCase,
    SubmitQuizAnswerUseCase,
    GetQuizProgressUseCase,
    ResetWeekProgressUseCase,
    GetQuizSetWithProgressUseCase,
    ReorderQuizzesUseCase,

    // Handlers
    CreateQuizHandler,
    GetQuizHandler,
    GetAllQuizzesHandler,
    GetQuizzesBySetHandler,
    UpdateQuizHandler,
    DeleteQuizHandler,
    CreateQuizSetHandler,
    UpdateQuizSetHandler,
    DeleteQuizSetHandler,
    GetQuizSetHandler,
    GetCurrentWeekQuizSetsHandler,
    GetQuizSetsHandler,
    ActivateQuizSetHandler,
    DeactivateQuizSetHandler,
    SubmitQuizAnswerHandler,
    GetQuizProgressHandler,
    ResetWeekProgressHandler,
    GetQuizSetWithProgressHandler,
    ReorderQuizzesHandler,
  ],
  exports: [QUIZ_SET_REPOSITORY_TOKEN, USER_QUIZ_PROGRESS_REPOSITORY_TOKEN, QUIZ_ANSWER_REPOSITORY_TOKEN, SystemStateService],
})
export class QuizModule implements OnModuleInit {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly createQuizHandler: CreateQuizHandler,
    private readonly getQuizHandler: GetQuizHandler,
    private readonly getAllQuizzesHandler: GetAllQuizzesHandler,
    private readonly getQuizzesBySetHandler: GetQuizzesBySetHandler,
    private readonly updateQuizHandler: UpdateQuizHandler,
    private readonly deleteQuizHandler: DeleteQuizHandler,
    private readonly createQuizSetHandler: CreateQuizSetHandler,
    private readonly updateQuizSetHandler: UpdateQuizSetHandler,
    private readonly deleteQuizSetHandler: DeleteQuizSetHandler,
    private readonly getQuizSetHandler: GetQuizSetHandler,
    private readonly getCurrentWeekQuizSetsHandler: GetCurrentWeekQuizSetsHandler,
    private readonly getQuizSetsHandler: GetQuizSetsHandler,
    private readonly activateQuizSetHandler: ActivateQuizSetHandler,
    private readonly deactivateQuizSetHandler: DeactivateQuizSetHandler,
    private readonly submitQuizAnswerHandler: SubmitQuizAnswerHandler,
    private readonly getQuizProgressHandler: GetQuizProgressHandler,
    private readonly resetWeekProgressHandler: ResetWeekProgressHandler,
    private readonly getQuizSetWithProgressHandler: GetQuizSetWithProgressHandler,
    private readonly reorderQuizzesHandler: ReorderQuizzesHandler,
  ) {}

  onModuleInit() {
    registerCommandHandlers(
      this.commandBus,
      [
        { handler: this.createQuizHandler, class: CreateQuizHandler },
        { handler: this.getQuizHandler, class: GetQuizHandler },
        { handler: this.getAllQuizzesHandler, class: GetAllQuizzesHandler },
        { handler: this.getQuizzesBySetHandler, class: GetQuizzesBySetHandler },
        { handler: this.updateQuizHandler, class: UpdateQuizHandler },
        { handler: this.deleteQuizHandler, class: DeleteQuizHandler },
        { handler: this.createQuizSetHandler, class: CreateQuizSetHandler },
        { handler: this.updateQuizSetHandler, class: UpdateQuizSetHandler },
        { handler: this.deleteQuizSetHandler, class: DeleteQuizSetHandler },
        { handler: this.getQuizSetHandler, class: GetQuizSetHandler },
        { handler: this.getCurrentWeekQuizSetsHandler, class: GetCurrentWeekQuizSetsHandler },
        { handler: this.getQuizSetsHandler, class: GetQuizSetsHandler },
        { handler: this.activateQuizSetHandler, class: ActivateQuizSetHandler },
        { handler: this.deactivateQuizSetHandler, class: DeactivateQuizSetHandler },
        { handler: this.submitQuizAnswerHandler, class: SubmitQuizAnswerHandler },
        { handler: this.getQuizProgressHandler, class: GetQuizProgressHandler },
        { handler: this.resetWeekProgressHandler, class: ResetWeekProgressHandler },
        { handler: this.getQuizSetWithProgressHandler, class: GetQuizSetWithProgressHandler },
        { handler: this.reorderQuizzesHandler, class: ReorderQuizzesHandler },
      ],
      'QuizModule',
    );
  }
}
