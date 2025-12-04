import { ICommand } from '@common/command/command.interface';
import { QuizSetListQueryDto } from '@module/quiz/application/dto/quiz-set-list-query.dto';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetQuizSetsQuery extends QuizSetListQueryDto {}

export class GetQuizSetsCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly query: GetQuizSetsQuery) {
    this.commandId = `get-quiz-sets-${Date.now()}`;
  }
}
