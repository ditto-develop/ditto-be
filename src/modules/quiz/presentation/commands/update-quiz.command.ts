import { ICommand } from '@common/command/command.interface';
import { UpdateQuizDto } from '@module/quiz/application/dto/update-quiz.dto';

export class UpdateQuizCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly quizId: string,
    public readonly dto: UpdateQuizDto,
  ) {
    this.commandId = `update-quiz-${Date.now()}`;
  }
}
