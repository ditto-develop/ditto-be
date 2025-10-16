import { Module } from '@nestjs/common';
import { IGameAnswerCounterToken } from './game-answer-counter.interface';
import { InMemoryGameAnswerCounter } from './in-memory-game-answer.counter';

@Module({
  providers: [{ provide: IGameAnswerCounterToken, useClass: InMemoryGameAnswerCounter }],
  exports: [IGameAnswerCounterToken],
})
export class GameAnswerCounterModule {}
