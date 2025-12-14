import { EntityNotFoundException } from '@common/exceptions/domain.exception';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '@module/user/domain/entities/user.entity';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';

@Injectable()
export class GetMyProfileUseCase {
  constructor(@Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository) {
    console.log('[GetMyProfileUseCase] GetMyProfileUseCase 초기화');
  }

  async execute(userId: string): Promise<User> {
    console.log(`[GetMyProfileUseCase] 본인 프로필 조회 실행: userId=${userId}`);
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new EntityNotFoundException('사용자', userId);
    }

    return user;
  }
}
