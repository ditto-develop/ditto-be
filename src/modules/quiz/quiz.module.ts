import { Module, OnModuleInit } from '@nestjs/common';
import { CommandBus } from 'src/common/command/command-bus';
import { CommandBusModule } from 'src/common/command/command-bus.module';
import { COMMAND_HANDLER_METADATA } from 'src/common/command/command-handler.decorator';
import { ICommand } from 'src/common/command/command.interface';
import { CommonModule } from 'src/modules/common/common.module';
import { CreateQuizUseCase } from 'src/modules/quiz/application/usecases/create-quiz.usecase';
import { UpdateQuizSetUseCase } from 'src/modules/quiz/application/usecases/update-quiz-set.usecase';
import { DeleteQuizSetUseCase } from 'src/modules/quiz/application/usecases/delete-quiz-set.usecase';
import { QUIZ_REPOSITORY_TOKEN } from 'src/modules/quiz/infrastructure/repository/quiz.repository.interface';
import { QuizRepository } from 'src/modules/quiz/infrastructure/repository/quiz.repository';
import { QUIZ_SET_REPOSITORY_TOKEN } from 'src/modules/quiz/infrastructure/repository/quiz-set.repository.interface';
import { QuizSetRepository } from 'src/modules/quiz/infrastructure/repository/quiz-set.repository';
import { CreateQuizHandler } from 'src/modules/quiz/presentation/commands/handlers/create-quiz.handler';
import { CreateQuizSetHandler } from 'src/modules/quiz/presentation/commands/handlers/create-quiz-set.handler';
import { UpdateQuizSetHandler } from 'src/modules/quiz/presentation/commands/handlers/update-quiz-set.handler';
import { DeleteQuizSetHandler } from 'src/modules/quiz/presentation/commands/handlers/delete-quiz-set.handler';
import { QuizController } from 'src/modules/quiz/presentation/controller/quiz.controller';
import { QuizSetController } from 'src/modules/quiz/presentation/controller/quiz-set.controller';
import { CreateQuizSetUseCase } from 'src/modules/quiz/application/usecases/create-quiz-set.usecase';
import { GetQuizSetHandler } from 'src/modules/quiz/presentation/commands/handlers/get-quiz-set.handler';
import { GetQuizSetsHandler } from 'src/modules/quiz/presentation/commands/handlers/get-quiz-sets.handler';
import { ActivateQuizSetHandler } from 'src/modules/quiz/presentation/commands/handlers/activate-quiz-set.handler';
import { DeactivateQuizSetHandler } from 'src/modules/quiz/presentation/commands/handlers/deactivate-quiz-set.handler';
import { ActivateQuizSetUseCase } from 'src/modules/quiz/application/usecases/activate-quiz-set.usecase';
import { DeactivateQuizSetUseCase } from 'src/modules/quiz/application/usecases/deactivate-quiz-set.usecase';
import { GetQuizSetsUseCase } from 'src/modules/quiz/application/usecases/get-quiz-sets.usecase';

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
    CreateQuizSetUseCase,
    UpdateQuizSetUseCase,
    DeleteQuizSetUseCase,
    ActivateQuizSetUseCase,
    DeactivateQuizSetUseCase,
    GetQuizSetsUseCase,

    // Handlers
    CreateQuizHandler,
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
    private readonly createQuizSetHandler: CreateQuizSetHandler,
    private readonly updateQuizSetHandler: UpdateQuizSetHandler,
    private readonly deleteQuizSetHandler: DeleteQuizSetHandler,
    private readonly getQuizSetHandler: GetQuizSetHandler,
    private readonly getQuizSetsHandler: GetQuizSetsHandler,
    private readonly activateQuizSetHandler: ActivateQuizSetHandler,
    private readonly deactivateQuizSetHandler: DeactivateQuizSetHandler,
  ) {
    console.log('[QuizModule] QuizModule 초기화');
  }

  onModuleInit() {
    console.log('[QuizModule] 핸들러 등록 시작');

    const handlers = [
      { handler: this.createQuizHandler, class: CreateQuizHandler },
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
    ];

    handlers.forEach(({ handler, class: handlerClass }) => {
      const commandType = Reflect.getMetadata(
        COMMAND_HANDLER_METADATA,
        handlerClass,
      ) as new (...args: any[]) => ICommand;
      if (commandType) {
        const commandName = commandType.name;
        this.commandBus.registerHandler(commandName, handler);
        console.log(
          `[QuizModule] 핸들러 등록: ${handlerClass.name} -> ${commandName}`,
        );
      }
    });
    console.log('[QuizModule] 핸들러 등록 완료');
  }
}
