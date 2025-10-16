import { GameAnswerCounter } from './game-answer-counter.interface';
import { Binary } from '../../../../../common/types/common.type';

export class InMemoryGameAnswerCounter extends GameAnswerCounter {
  private memory: number[] = Array.from({ length: 4096 }, () => 0);

  increment(binary: Binary): Promise<void> {
    const key = this.binaryToNumber(binary);

    this.memory[key] = this.memory[key] + 1;
    return Promise.resolve();
  }
  get(binary: Binary): Promise<number> {
    const key = this.binaryToNumber(binary);

    return Promise.resolve(this.memory[key]);
  }
}
