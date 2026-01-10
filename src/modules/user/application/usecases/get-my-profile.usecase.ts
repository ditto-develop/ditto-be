import { EntityNotFoundException } from '@common/exceptions/domain.exception';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '@module/user/domain/entities/user.entity';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetMyProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {
    this.logger.log('GetMyProfileUseCase 초기화', 'GetMyProfileUseCase');
  }

  async execute(userId: string): Promise<User> {
    this.logger.log('본인 프로필 조회 실행', 'GetMyProfileUseCase', { userId });
    const user = await this.userRepo.findById(userId);

    if (!user) {
      this.logger.warn('본인 프로필 조회 실패: 사용자를 찾을 수 없음', 'GetMyProfileUseCase', { userId });
      throw new EntityNotFoundException('사용자', userId);
    }

    this.logger.log('본인 프로필 조회 성공', 'GetMyProfileUseCase', { userId });
    return user;
  }
}
