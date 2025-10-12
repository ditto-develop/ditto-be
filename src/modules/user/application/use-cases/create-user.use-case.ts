import { Inject, Injectable } from '@nestjs/common';
import { type IUserRepository, IUserRepositoryToken } from '../../ports/user.repository';
import { CreateUserCommand } from '../commands/create-user.command';
import { User } from '../../domain/user';

@Injectable()
export class CreateUserUseCase {
  constructor(@Inject(IUserRepositoryToken) private readonly userRepo: IUserRepository) {}

  async execute(cmd: CreateUserCommand): Promise<User> {
    // NOTE:: Validator가 필요하면 서비스로 만들어서 주입후 사용

    // NODE:: 중복체크가 필요하면 userRepo에서 찾아서 체크

    const user = User.create({ referredBy: cmd.referredBy });
    await this.userRepo.save(user);

    return user;
  }
}
