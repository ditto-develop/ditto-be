import { NanoId } from '../../../common/value-objects/nanoid.vo';
import { isInteger } from '../../../common/typeguards/common.type-guard';
import { SubmitAnswerDto } from '../presentation/dto/submit-answers.dto';

export class GameAnswer {
  readonly userId: NanoId;
  readonly gameId: NanoId;
  readonly selectedIndex: number;

  private constructor(userId: NanoId, gameId: NanoId, selectedIndex: number) {
    if (!isInteger(selectedIndex) || ![0, 1].includes(selectedIndex)) {
      throw new Error('Game options must include both index 0 and 1');
    }

    this.userId = userId;
    this.gameId = gameId;
    this.selectedIndex = selectedIndex;
    Object.freeze(this);
  }

  public static create(payload: SubmitAnswerDto): GameAnswer {
    const userId = NanoId.from(payload.userId);
    const gameId = NanoId.from(payload.gameId);
    return new GameAnswer(userId, gameId, payload.selectedIndex);
  }

  public toPlain(): SubmitAnswerDto {
    return {
      userId: this.userId.toString(),
      gameId: this.gameId.toString(),
      selectedIndex: this.selectedIndex,
    };
  }
}
