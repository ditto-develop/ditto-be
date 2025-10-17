import { GameAnswer } from '../domain/game-answer';

export const IGameAnswerRepositoryToken = Symbol('IGameAnswerRepository');

export interface IGameAnswerRepository {
  save(doamin: GameAnswer): Promise<void>;
  count(): Promise<number>;
  bulkSave(domains: GameAnswer[], chunkSize?: number): Promise<void>;
  findByUserId(userId: string): Promise<GameAnswer[]>;
  findOfCompleteUsers(requiredCount: number): Promise<GameAnswer[]>;
}
