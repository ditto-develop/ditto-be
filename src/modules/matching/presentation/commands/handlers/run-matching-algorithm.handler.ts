import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { Injectable } from '@nestjs/common';
import { RunMatchingAlgorithmCommand } from '../run-matching-algorithm.command';
import { RunMatchingAlgorithmUseCase } from '@module/matching/application/usecases/run-matching-algorithm.usecase';

@Injectable()
@CommandHandler(RunMatchingAlgorithmCommand)
export class RunMatchingAlgorithmHandler implements ICommandHandler<RunMatchingAlgorithmCommand, void> {
  constructor(
    private readonly runMatchingAlgorithmUseCase: RunMatchingAlgorithmUseCase,
  ) {}

  async execute(command: RunMatchingAlgorithmCommand): Promise<ICommandResult<void>> {
    const { quizSetId } = command;

    try {
      await this.runMatchingAlgorithmUseCase.execute(quizSetId);
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