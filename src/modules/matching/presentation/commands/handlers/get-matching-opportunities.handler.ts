import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { Injectable } from '@nestjs/common';
import { GetMatchingOpportunitiesCommand } from '../get-matching-opportunities.command';
import { GetMatchingOpportunitiesUseCase, MatchingOpportunityWithUser } from '@module/matching/application/usecases/get-matching-opportunities.usecase';

@Injectable()
@CommandHandler(GetMatchingOpportunitiesCommand)
export class GetMatchingOpportunitiesHandler implements ICommandHandler<GetMatchingOpportunitiesCommand, MatchingOpportunityWithUser[]> {
  constructor(
    private readonly getMatchingOpportunitiesUseCase: GetMatchingOpportunitiesUseCase,
  ) {}

  async execute(command: GetMatchingOpportunitiesCommand): Promise<ICommandResult<MatchingOpportunityWithUser[]>> {
    const { userId, quizSetId } = command;

    try {
      const opportunities = await this.getMatchingOpportunitiesUseCase.execute(userId, quizSetId);
      return {
        success: true,
        data: opportunities,
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