import { ICommand } from '@common/command/command.interface';
import { CreateQuizDto } from '@module/quiz/application/dto/create-quiz.dto';

export class CreateQuizCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly dto: CreateQuizDto) {
    this.commandId = `create-quiz-${Date.now()}`;
  }
}
