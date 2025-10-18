import { User } from '../domain/user';
import { UserEntity } from '../../../infra/db/entities/user/user.entity';

export const IUserRepositoryToken = Symbol('IUserRepository');

export interface IUserRepository {
  save(user: User): Promise<void>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<UserEntity>;
  count(): Promise<number>;
  bulkSave(users: User[], chunkSize?: number): Promise<void>;
}
