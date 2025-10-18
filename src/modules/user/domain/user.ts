import { NanoId } from '../../../common/value-objects/nanoid.vo';
import { isInteger, isString } from '../../../common/typeguards/common.type-guard';

export type NewUserProps = Partial<User>;

export class Image {
  userId: NanoId;
  round: number;
  imagePath: string;

  private constructor(userId: NanoId, round: number, imagePath: string) {
    if (!isInteger(round) || round <= 0) {
      throw new Error('Image.round must be greater than 0');
    }
    if (!imagePath || !isString(imagePath) || imagePath.trim().length === 0) {
      throw new Error('Image.imagePath must be non-empty string');
    }

    this.userId = userId;
    this.round = round;
    this.imagePath = imagePath;
    Object.freeze(this);
  }

  public static create(userId: NanoId, round: number, imagePath: string) {
    return new Image(userId, round, imagePath);
  }
}

export class User {
  readonly id: NanoId; // 고유 아이디
  readonly email?: string | null; // 이메일
  readonly referralToken: NanoId; // 추천 코드 (발급)
  readonly referredBy?: NanoId | null; // 추천인 코드 (입력)
  readonly images?: Image[] | null;

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
