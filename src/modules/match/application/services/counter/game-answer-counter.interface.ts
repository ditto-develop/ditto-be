import { Binary } from '../../../../../common/types/common.type';
import { isBinary } from '../../../../../common/typeguards/common.type-guard';

export const IGameAnswerCounterToken = Symbol('IGameAnswerCounterToken');

export interface IGameAnswerCounter {
  increment(binary: Binary): Promise<void>;
  get(binary: Binary): Promise<number>;
}

export abstract class GameAnswerCounter implements IGameAnswerCounter {
  abstract increment(binary: Binary): Promise<void>;

  abstract get(binary: Binary): Promise<number>;

  protected binaryToNumber(binary: Binary): number {
    if (!this.isBinary12Key(binary)) throw Error(`키 형태가 아닙니다. value: ${String(binary)}`);
    return Number.parseInt(binary, 2);
  }

  private isBinary12Key(binary: Binary) {
    if (!isBinary(binary)) return false;
    return binary.length === 12;
  }
}
