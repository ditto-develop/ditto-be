import { Inject } from '@nestjs/common';
import { type IUserRepository, IUserRepositoryToken } from '../../ports/user.repository';
import { User } from '../../domain/user';

export class CreateRandomUsersUserCase {
  constructor(@Inject(IUserRepositoryToken) private readonly userRepo: IUserRepository) {}

  async execute(count: number): Promise<void> {
    const users = Array.from({ length: count }, () => User.create({}));
    await this.userRepo.bulkSave(users);
  }
}
