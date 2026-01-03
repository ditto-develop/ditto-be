import { ICommand } from '@common/command/command.interface';
import { SubmitQuizAnswerDto } from '@module/quiz/application/dto/submit-quiz-answer.dto';

export class SubmitQuizAnswerCommand implements ICommand {
  readonly commandId: string;

  constructor(
    public readonly userId: string,
    public readonly dto: SubmitQuizAnswerDto,
  ) {
    this.commandId = `submit-quiz-answer-${userId}-${dto.quizId}-${Date.now()}`;
  }
}
