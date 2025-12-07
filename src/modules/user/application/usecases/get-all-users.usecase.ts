import { Inject, Injectable } from '@nestjs/common';
import { User } from '@module/user/domain/entities/user.entity';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';

@Injectable()
export class GetAllUsersUseCase {
  constructor(@Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository) {
    console.log('[GetAllUsersUseCase] GetAllUsersUseCase 초기화');
  }

  async execute(requestUserId: string): Promise<User[]> {
    console.log(`[GetAllUsersUseCase] 모든 사용자 조회 실행: requestUserId=${requestUserId}`);

    // 요청자 정보 조회
    const requestUser = await this.userRepo.findById(requestUserId);
    if (!requestUser) {
      throw new EntityNotFoundException('요청자', requestUserId);
    }

    // 권한 검증: 관리자만 모든 사용자 조회 가능
    if (!requestUser.isAdmin()) {
      throw new BusinessRuleException('관리자 권한이 필요합니다.', 'ADMIN_ACCESS_REQUIRED');
    }

    return await this.userRepo.findAll();
  }
}
