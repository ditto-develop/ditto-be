import { ICommand } from '@common/command/command.interface';
import { ReorderQuizzesDto } from '@module/quiz/application/dto/reorder-quizzes.dto';

export class ReorderQuizzesCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly quizSetId: string,
    public readonly dto: ReorderQuizzesDto,
  ) {
    this.commandId = `reorder-quizzes-${Date.now()}`;
  }
}

