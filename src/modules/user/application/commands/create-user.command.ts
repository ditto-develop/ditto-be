import { NanoId } from '../../../../common/value-objects/nanoid.vo';

export class CreateUserCommand {
  readonly referredBy?: NanoId | null;

  constructor(referredBy?: string | null) {
    if (referredBy) this.referredBy = NanoId.from(referredBy);
    Object.freeze(this);
  }
}
