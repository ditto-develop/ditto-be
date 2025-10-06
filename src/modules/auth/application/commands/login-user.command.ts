import { NanoId } from '../../../../common/value-objects/nanoid.vo';

export class LoginUserCommand {
  readonly id: NanoId;

  constructor(id: string) {
    this.id = NanoId.from(id);
    Object.freeze(this);
  }
}
