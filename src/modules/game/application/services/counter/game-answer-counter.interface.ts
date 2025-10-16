import { Binary } from '../../../../../common/types/common.type';
import { isBinary } from '../../../../../common/typeguards/common.type-guard';
import { GameCount } from '../../../domain/game';
import { bindCallbackInternals } from 'rxjs/internal/observable/bindCallbackInternals';

export const IGameAnswerCounterToken = Symbol('IGameAnswerCounterToken');

export interface IGameAnswerCounter {
  increment(round: number, binary: Binary): Promise<void>;
  get(round: number, binary: Binary): Promise<number>;
  getTotal(): Promise<number>;
}

export abstract class GameAnswerCounter implements IGameAnswerCounter {
  abstract increment(round: number, binary: Binary): Promise<void>;

  abstract get(round: number, binary: Binary): Promise<number>;

  abstract getTotal(): Promise<number>;

  public static binaryToNumber(round: number, binary: Binary): number {
    if (!this.isBinaryGameKey(round, binary))
      throw Error(`${round} 라운드의 키 형태가 아닙니다. value: ${String(binary)}`);
    return Number.parseInt(binary, 2);
  }

  public static isBinaryGameKey(round: number, binary: Binary) {
    if (!isBinary(binary)) return false;
    return binary.length === GameCount[String(round)];
  }
}
