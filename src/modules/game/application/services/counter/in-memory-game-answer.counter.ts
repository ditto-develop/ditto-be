import { GameAnswerCounter } from './game-answer-counter.interface';
import { Binary } from '../../../../../common/types/common.type';
import { GameCount } from '../../../domain/game';

export class InMemoryGameAnswerCounter extends GameAnswerCounter {
  private readonly memorySize: number;
  private readonly memory: number[];

  constructor() {
    super();
    this.memorySize = Math.pow(2, GameCount['1']);
    this.memory = Array.from({ length: this.memorySize + 1 }, () => 0);
  }

  private incrementTotal() {
    this.memory[this.memorySize] = this.memory[this.memorySize] + 1;
  }

  increment(binary: Binary): Promise<void> {
    const key = this.binaryToNumber(binary);

    this.memory[key] = this.memory[key] + 1;
    this.incrementTotal();
    return Promise.resolve();
  }

  get(binary: Binary): Promise<number> {
    const key = this.binaryToNumber(binary);

    return Promise.resolve(this.memory[key]);
  }

  getTotal(): Promise<number> {
    return Promise.resolve(this.memory[this.memorySize]);
  }
}
