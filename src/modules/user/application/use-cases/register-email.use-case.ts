import { Inject, Injectable } from '@nestjs/common';
import { type IUserRepository, IUserRepositoryToken } from '../../ports/user.repository';
import { User } from '../../domain/user';
import { RegisterEmailCommand } from '../commands/register-email.command';
import { NanoId } from '../../../../common/value-objects/nanoid.vo';

@Injectable()
export class RegisterEmailUseCase {
  constructor(@Inject(IUserRepositoryToken) private readonly userRepo: IUserRepository) {}

  async execute(cmd: RegisterEmailCommand): Promise<User> {
    const userEntity = await this.userRepo.findById(cmd.id.toString());
    console.log(cmd);
    const user = User.create({
      id: NanoId.from(userEntity.id),
      email: cmd.email,
      referralToken: NanoId.from(userEntity.referralToken),
      referredBy: userEntity.referredBy ? NanoId.from(userEntity.referredBy) : null,
    });

    await this.userRepo.save(user);
    return user;
  }
}
