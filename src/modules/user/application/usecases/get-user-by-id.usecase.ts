import { EntityNotFoundException } from '@common/exceptions/domain.exception';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '@module/user/domain/entities/user.entity';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';

@Injectable()
export class GetUserByIdUseCase {
  constructor(@Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository) {
    console.log('[GetUserByIdUseCase] GetUserByIdUseCase 초기화');
  }

  async execute(id: string): Promise<User> {
    console.log(`[GetUserByIdUseCase] 사용자 조회 실행: id=${id}`);
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new EntityNotFoundException('사용자', id);
    }

    return user;
  }
}
