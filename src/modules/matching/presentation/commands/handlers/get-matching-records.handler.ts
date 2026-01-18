import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { Injectable } from '@nestjs/common';
import { GetMatchingRecordsCommand } from '../get-matching-records.command';
import { GetMatchingRecordsUseCase } from '@module/matching/application/usecases/get-matching-records.usecase';
import { MatchingRecordWithUser } from '@module/matching/application/usecases/get-matching-records.usecase';

@Injectable()
@CommandHandler(GetMatchingRecordsCommand)
export class GetMatchingRecordsHandler implements ICommandHandler<GetMatchingRecordsCommand, MatchingRecordWithUser[]> {
  constructor(private readonly getMatchingRecordsUseCase: GetMatchingRecordsUseCase) {}

  async execute(command: GetMatchingRecordsCommand): Promise<ICommandResult<MatchingRecordWithUser[]>> {
    const { userId, quizSetId } = command;

    try {
      const records = await this.getMatchingRecordsUseCase.execute(userId, quizSetId);
      return {
        success: true,
        data: records,
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