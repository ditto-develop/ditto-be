import { Inject } from '@nestjs/common';
import { type IGameAnswerRepository, IGameAnswerRepositoryToken } from '../../ports/game-answer.repository';
import { SubmitGameAnswerCommand } from '../commands/submit-game-answer.command';

export class SubmitGameAnswerUseCase {
  constructor(
    @Inject(IGameAnswerRepositoryToken)
    private readonly gameAnswerRepo: IGameAnswerRepository,
  ) {}

  async execute(cmd: SubmitGameAnswerCommand): Promise<void> {
    const gameAnswer = cmd.toDomain();
    await this.gameAnswerRepo.save(gameAnswer);
    return;
  }
}
