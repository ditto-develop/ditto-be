import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { Injectable } from '@nestjs/common';
import { RetryMatchingAlgorithmCommand } from '../retry-matching-algorithm.command';
import { RetryMatchingAlgorithmUseCase } from '@module/matching/application/usecases/retry-matching-algorithm.usecase';

@Injectable()
@CommandHandler(RetryMatchingAlgorithmCommand)
export class RetryMatchingAlgorithmHandler implements ICommandHandler<RetryMatchingAlgorithmCommand, void> {
  constructor(
    private readonly retryMatchingAlgorithmUseCase: RetryMatchingAlgorithmUseCase,
  ) {}

  async execute(command: RetryMatchingAlgorithmCommand): Promise<ICommandResult<void>> {
    const { quizSetId } = command;

    try {
      await this.retryMatchingAlgorithmUseCase.execute(quizSetId);
      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}