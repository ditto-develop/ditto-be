import { nanoid } from 'nanoid';

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NanoId {
  private readonly value: string;
  public static readonly MIN_LENGTH = 21;
  public static readonly MAX_LENGTH = 32;
  public static readonly DEFAULT_LENGTH = 21;

  private static readonly ALLOWED_REGEX = /^[A-Za-z0-9\-_]+$/;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }
  public toString(): string {
    return this.value;
  }
  public equals(other: NanoId): boolean {
    return other !== null && this.value === other.value;
  }

  public static from(value: string): NanoId {
    if (!value) {
      throw new DomainError('NanoId must be provided');
    }

    if (!NanoId.ALLOWED_REGEX.test(value)) {
      throw new DomainError('NanoId contains invalid characters');
    }

    const len = value.length;
    if (len < this.MIN_LENGTH || len > this.MAX_LENGTH) {
      throw new DomainError(`NanoId length must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters`);
    }

    return new NanoId(value);
  }

  public static createWith(generator: (size?: number) => string): NanoId {
    const generated = generator(this.DEFAULT_LENGTH);
    return NanoId.from(generated);
  }

  public static create(): NanoId {
    return NanoId.createWith(nanoid);
  }
}
