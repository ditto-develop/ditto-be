import { ICommand } from 'src/common/command/command.interface';
import { UpdateQuizSetDto } from 'src/modules/quiz/application/dto/update-quiz-set.dto';

export class UpdateQuizSetCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly id: string,
    public readonly dto: UpdateQuizSetDto,
  ) {
    this.commandId = `update-quiz-set-${Date.now()}`;
  }
}
