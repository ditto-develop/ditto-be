import { User } from '../domain/user';
import { UserEntity } from '../../../infra/db/entities/user.entity';

export const IUserRepositoryToken = Symbol('IUserRepository');

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<UserEntity>;
}
