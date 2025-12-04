import { BusinessRuleException } from '@common/exceptions/domain.exception';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '@module/user/domain/entities/user.entity';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';

@Injectable()
export class LeaveUserUseCase {
  constructor(@Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository) {
    console.log('[LeaveUserUseCase] LeaveUserUseCase 초기화');
  }

  async execute(id: string, currentUser: User): Promise<User> {
    console.log(`[LeaveUserUseCase] 사용자 탈퇴 처리 실행: id=${id}`);

    // 대상 사용자 조회
    const targetUser = await this.userRepo.findById(id);
    if (!targetUser) {
      throw new BusinessRuleException('사용자를 찾을 수 없습니다.');
    }

    // 권한 검증: 관리자이거나 본인만 탈퇴 가능
    if (!currentUser.isAdmin() && currentUser.id !== id) {
      throw new BusinessRuleException('본인 계정만 탈퇴할 수 있습니다.');
    }

    // 이미 탈퇴한 사용자는 처리하지 않음
    if (!targetUser.isActive()) {
      throw new BusinessRuleException('이미 탈퇴한 사용자입니다.');
    }

    return await this.userRepo.softDelete(id);
  }
}
