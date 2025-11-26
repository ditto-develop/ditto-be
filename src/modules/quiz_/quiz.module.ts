import { Module } from '@nestjs/common';
import { QuizSetController } from './presentation/controllers/quiz-set.controller';
import { QuizController } from './presentation/controllers/quiz.controller';
import { QuizAnswerController } from './presentation/controllers/quiz-answer.controller';
import { CreateQuizSetUseCase } from './application/usecases/create-quiz-set.usecase';
import { UpdateQuizSetUseCase } from './application/usecases/update-quiz-set.usecase';
import { GetQuizSetUseCase } from './application/usecases/get-quiz-set.usecase';
import { DeleteQuizSetUseCase } from './application/usecases/delete-quiz-set.usecase';
import { CreateQuizUseCase } from './application/usecases/create-quiz.usecase';
import { SwapQuizOrderUseCase } from './application/usecases/swap-quiz-order.usecase';
import { SubmitQuizAnswerUseCase } from './application/usecases/submit-quiz-answer.usecase';
import { QuizDomainService } from './domain/quiz.domain.service';
import { QuizSetRepository } from './infrastructure/quiz-set.repository';
import { QuizRepository } from './infrastructure/quiz.repository';
import { ChoiceRepository } from './infrastructure/choice.repository';
import { QuizAnswerRepository } from './infrastructure/quiz-answer.repository';
import { PrismaService } from './infrastructure/prisma.service';

const QuizSetRepositoryProvider = {
  provide: 'QuizSetRepositoryPort',
  useClass: QuizSetRepository,
};

const QuizRepositoryProvider = {
  provide: 'QuizRepositoryPort',
  useClass: QuizRepository,
};

const ChoiceRepositoryProvider = {
  provide: 'ChoiceRepositoryPort',
  useClass: ChoiceRepository,
};

const QuizAnswerRepositoryProvider = {
  provide: 'QuizAnswerRepositoryPort',
  useClass: QuizAnswerRepository,
};

@Module({
  controllers: [
    QuizSetController,
    QuizController,
    QuizAnswerController,
  ],
  providers: [
    // Infrastructure
    PrismaService,
    QuizSetRepositoryProvider,
    QuizRepositoryProvider,
    ChoiceRepositoryProvider,
    QuizAnswerRepositoryProvider,
    
    // Domain
    QuizDomainService,
    
    // Application
    CreateQuizSetUseCase,
    UpdateQuizSetUseCase,
    GetQuizSetUseCase,
    DeleteQuizSetUseCase,
    CreateQuizUseCase,
    SwapQuizOrderUseCase,
    SubmitQuizAnswerUseCase,
  ],
  exports: [
    PrismaService,
    QuizSetRepositoryProvider,
    QuizRepositoryProvider,
    ChoiceRepositoryProvider,
    QuizAnswerRepositoryProvider,
  ],
})
export class QuizModule {}
