import { NanoId } from '../../../common/value-objects/nanoid.vo';

export type NewUserProps = Partial<User>;

export class User {
  readonly id: NanoId; // 고유 아이디
  readonly email?: string | null; // 이메일
  readonly referralToken: NanoId; // 추천 코드 (발급)
  readonly referredBy?: NanoId | null; // 추천인 코드 (입력)

  private constructor(props: NewUserProps) {
    this.id = props.id ?? NanoId.create();
    this.email = props.email;
    this.referralToken = props.referralToken ?? NanoId.create();
    this.referredBy = props.referredBy;

    this.ensureInvariants();
  }

  static create(props: NewUserProps) {
    if (props.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email)) {
        throw new Error('InvalidEmailFormat');
      }
    }

    return new User(props);
  }

  getEmail(): string | null {
    return this.email ?? null;
  }

  private ensureInvariants(): void {
    if (this.email && this.email?.length > 320) throw new Error('EmailTooLong');
  }

  get referralLink() {
    return `https://example.com/r/${this.referralToken.toString()}`;
  }
}
