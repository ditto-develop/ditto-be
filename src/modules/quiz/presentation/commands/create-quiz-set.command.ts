import { ICommand } from 'src/common/command/command.interface';
import { CreateQuizSetDto } from 'src/modules/quiz/application/dto/create-quiz-set.dto';

export class CreateQuizSetCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly dto: CreateQuizSetDto) {
    this.commandId = `create-quiz-set-${Date.now()}`;
  }
}
