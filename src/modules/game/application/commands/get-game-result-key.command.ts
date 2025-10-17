import { GetGameResultKeyDto } from '../../presentation/dto/submit-answers.dto';

export class GetGameResultKeyCommand {
  constructor(private readonly dto: GetGameResultKeyDto) {}

  public get userId(): string {
    return this.dto.userId;
  }

  public get round(): number {
    return this.dto.round;
  }
}
