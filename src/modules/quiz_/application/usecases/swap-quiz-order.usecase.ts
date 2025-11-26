import { Injectable, Inject } from '@nestjs/common';
import { QuizDomainService } from '../../domain/quiz.domain.service';
import { SwapQuizOrderCommand } from '../commands/swap-quiz-order.command';

@Injectable()
export class SwapQuizOrderUseCase {
  constructor(
    private readonly quizDomainService: QuizDomainService,
  ) {}

  async execute(command: SwapQuizOrderCommand): Promise<void> {
    const { quizId1, quizId2 } = command;

    await this.quizDomainService.swapQuizOrder(quizId1, quizId2);
  }
}
