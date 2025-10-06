import { NanoId } from '../../../../common/value-objects/nanoid.vo';

export class RegisterEmailCommand {
  readonly id: NanoId;
  readonly email: string;

  constructor(id: string, email: string) {
    this.id = NanoId.from(id);
    this.email = email;
    Object.freeze(this);
  }
}
