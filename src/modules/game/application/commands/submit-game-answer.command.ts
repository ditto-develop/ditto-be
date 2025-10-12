import { SubmitAnswerDto } from '../../presentation/dto/submit-answers.dto';
import { GameAnswer } from '../../domain/game-answer';

export class SubmitGameAnswerCommand {
  constructor(private readonly dto: SubmitAnswerDto) {}

  public toDomain(): GameAnswer {
    const domainPayload = {
      userId: this.dto.userId,
      gameId: this.dto.gameId,
      selectedIndex: this.dto.selectedIndex,
    };
    return GameAnswer.create(domainPayload);
  }

  public get gameId() {
    return this.dto.gameId;
  }
}
