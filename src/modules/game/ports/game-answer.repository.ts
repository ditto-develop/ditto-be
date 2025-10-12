import { GameAnswer } from '../domain/game-answer';

export const IGameAnswerRepositoryToken = Symbol('IGameAnswerRepository');

export interface IGameAnswerRepository {
  save(doamin: GameAnswer): Promise<void>;
}
