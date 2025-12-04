import { Inject, Injectable } from '@nestjs/common';
import { User } from '@module/user/domain/entities/user.entity';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';

@Injectable()
export class GetAllUsersUseCase {
  constructor(@Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository) {
    console.log('[GetAllUsersUseCase] GetAllUsersUseCase 초기화');
  }

  async execute(): Promise<User[]> {
    console.log('[GetAllUsersUseCase] 모든 사용자 조회 실행');
    return await this.userRepo.findAll();
  }
}
