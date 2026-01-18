import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { Injectable } from '@nestjs/common';
import { CreateMatchingRecordCommand } from '../create-matching-record.command';
import { CreateMatchingRecordUseCase } from '@module/matching/application/usecases/create-matching-record.usecase';
import { MatchingRecord } from '@module/matching/domain/entities/matching-record.entity';

@Injectable()
@CommandHandler(CreateMatchingRecordCommand)
export class CreateMatchingRecordHandler implements ICommandHandler<CreateMatchingRecordCommand, MatchingRecord> {
  constructor(
    private readonly createMatchingRecordUseCase: CreateMatchingRecordUseCase,
  ) {}

  async execute(command: CreateMatchingRecordCommand): Promise<ICommandResult<MatchingRecord>> {
    const { userId, matchedUserId, quizSetId } = command;

    try {
      const record = await this.createMatchingRecordUseCase.execute(userId, matchedUserId, quizSetId);
      return {
        success: true,
        data: record,
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