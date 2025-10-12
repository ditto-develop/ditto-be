import { Game } from '../domain/game';

export const IGameRepositoryToken = Symbol('IGameRepository');

export interface IGameRepository {
  save(domain: Game): Promise<Game>;
  findAll(round: number): Promise<Game[]>;
  count(round: number): Promise<number>;
}
