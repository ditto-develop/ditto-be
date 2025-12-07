import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
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

  async execute(id: string, requestUserId: string): Promise<User> {
    console.log(`[GetUserByIdUseCase] 사용자 조회 실행: id=${id}, requestUserId=${requestUserId}`);

    // 요청자 정보 조회
    const requestUser = await this.userRepo.findById(requestUserId);
    if (!requestUser) {
      throw new EntityNotFoundException('요청자', requestUserId);
    }

    // 대상 사용자 조회
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new EntityNotFoundException('사용자', id);
    }

    // 권한 검증: 관리자이거나 본인만 조회 가능
    if (!user.canBeAccessedBy(requestUser)) {
      throw new BusinessRuleException('접근 권한이 없습니다.', 'INSUFFICIENT_PERMISSIONS');
    }

    return user;
  }
}
