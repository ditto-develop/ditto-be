import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { CommonModule } from '@module/common/common.module';
import { ActivateQuizSetUseCase } from '@module/quiz/application/usecases/activate-quiz-set.usecase';
import { CreateQuizSetUseCase } from '@module/quiz/application/usecases/create-quiz-set.usecase';
import { CreateQuizUseCase } from '@module/quiz/application/usecases/create-quiz.usecase';
import { DeactivateQuizSetUseCase } from '@module/quiz/application/usecases/deactivate-quiz-set.usecase';
import { DeleteQuizSetUseCase } from '@module/quiz/application/usecases/delete-quiz-set.usecase';
import { DeleteQuizUseCase } from '@module/quiz/application/usecases/delete-quiz.usecase';
import { GetQuizSetsUseCase } from '@module/quiz/application/usecases/get-quiz-sets.usecase';
import { GetQuizUseCase } from '@module/quiz/application/usecases/get-quiz.usecase';
import { GetQuizzesBySetUseCase } from '@module/quiz/application/usecases/get-quizzes-by-set.usecase';
import { UpdateQuizSetUseCase } from '@module/quiz/application/usecases/update-quiz-set.usecase';
import { UpdateQuizUseCase } from '@module/quiz/application/usecases/update-quiz.usecase';
import { QuizSetRepository } from '@module/quiz/infrastructure/repository/quiz-set.repository';
import { QUIZ_SET_REPOSITORY_TOKEN } from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import { QuizRepository } from '@module/quiz/infrastructure/repository/quiz.repository';
import { QUIZ_REPOSITORY_TOKEN } from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { ActivateQuizSetHandler } from '@module/quiz/presentation/commands/handlers/activate-quiz-set.handler';
import { CreateQuizSetHandler } from '@module/quiz/presentation/commands/handlers/create-quiz-set.handler';
import { CreateQuizHandler } from '@module/quiz/presentation/commands/handlers/create-quiz.handler';
import { DeactivateQuizSetHandler } from '@module/quiz/presentation/commands/handlers/deactivate-quiz-set.handler';
import { DeleteQuizHandler } from '@module/quiz/presentation/commands/handlers/delete-quiz.handler';
import { DeleteQuizSetHandler } from '@module/quiz/presentation/commands/handlers/delete-quiz-set.handler';
import { GetQuizHandler } from '@module/quiz/presentation/commands/handlers/get-quiz.handler';
import { GetQuizSetHandler } from '@module/quiz/presentation/commands/handlers/get-quiz-set.handler';
import { GetQuizSetsHandler } from '@module/quiz/presentation/commands/handlers/get-quiz-sets.handler';
import { GetQuizzesBySetHandler } from '@module/quiz/presentation/commands/handlers/get-quizzes-by-set.handler';
import { UpdateQuizHandler } from '@module/quiz/presentation/commands/handlers/update-quiz.handler';
import { UpdateQuizSetHandler } from '@module/quiz/presentation/commands/handlers/update-quiz-set.handler';
import { QuizSetController } from '@module/quiz/presentation/controller/quiz-set.controller';
import { QuizController } from '@module/quiz/presentation/controller/quiz.controller';
import { Module, OnModuleInit } from '@nestjs/common';

const QuizRepositoryProvider = {
  provide: QUIZ_REPOSITORY_TOKEN,
  useClass: QuizRepository,
};

const QuizSetRepositoryProvider = {
  provide: QUIZ_SET_REPOSITORY_TOKEN,
  useClass: QuizSetRepository,
};

@Module({
  imports: [CommandBusModule, CommonModule],
  controllers: [QuizController, QuizSetController],
  providers: [
    // Repositories
    QuizRepositoryProvider,
    QuizSetRepositoryProvider,

    // UseCases
    CreateQuizUseCase,
    GetQuizUseCase,
    GetQuizzesBySetUseCase,
    UpdateQuizUseCase,
    DeleteQuizUseCase,
    CreateQuizSetUseCase,
    UpdateQuizSetUseCase,
    DeleteQuizSetUseCase,
    ActivateQuizSetUseCase,
    DeactivateQuizSetUseCase,
    GetQuizSetsUseCase,

    // Handlers
    CreateQuizHandler,
    GetQuizHandler,
    GetQuizzesBySetHandler,
    UpdateQuizHandler,
    DeleteQuizHandler,
    CreateQuizSetHandler,
    UpdateQuizSetHandler,
    DeleteQuizSetHandler,
    GetQuizSetHandler,
    GetQuizSetsHandler,
    ActivateQuizSetHandler,
    DeactivateQuizSetHandler,
  ],
  exports: [],
})
export class QuizModule implements OnModuleInit {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly createQuizHandler: CreateQuizHandler,
    private readonly getQuizHandler: GetQuizHandler,
    private readonly getQuizzesBySetHandler: GetQuizzesBySetHandler,
    private readonly updateQuizHandler: UpdateQuizHandler,
    private readonly deleteQuizHandler: DeleteQuizHandler,
    private readonly createQuizSetHandler: CreateQuizSetHandler,
    private readonly updateQuizSetHandler: UpdateQuizSetHandler,
    private readonly deleteQuizSetHandler: DeleteQuizSetHandler,
    private readonly getQuizSetHandler: GetQuizSetHandler,
    private readonly getQuizSetsHandler: GetQuizSetsHandler,
    private readonly activateQuizSetHandler: ActivateQuizSetHandler,
    private readonly deactivateQuizSetHandler: DeactivateQuizSetHandler,
  ) {}

  onModuleInit() {
    registerCommandHandlers(
      this.commandBus,
      [
        { handler: this.createQuizHandler, class: CreateQuizHandler },
        { handler: this.getQuizHandler, class: GetQuizHandler },
        { handler: this.getQuizzesBySetHandler, class: GetQuizzesBySetHandler },
        { handler: this.updateQuizHandler, class: UpdateQuizHandler },
        { handler: this.deleteQuizHandler, class: DeleteQuizHandler },
        { handler: this.createQuizSetHandler, class: CreateQuizSetHandler },
        { handler: this.updateQuizSetHandler, class: UpdateQuizSetHandler },
        { handler: this.deleteQuizSetHandler, class: DeleteQuizSetHandler },
        { handler: this.getQuizSetHandler, class: GetQuizSetHandler },
        { handler: this.getQuizSetsHandler, class: GetQuizSetsHandler },
        { handler: this.activateQuizSetHandler, class: ActivateQuizSetHandler },
        {
          handler: this.deactivateQuizSetHandler,
          class: DeactivateQuizSetHandler,
        },
      ],
      'QuizModule',
    );
  }
}
