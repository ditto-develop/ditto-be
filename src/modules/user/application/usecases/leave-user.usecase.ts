import { BusinessRuleException, EntityNotFoundException } from '@common/exceptions/domain.exception';
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

  async execute(id: string, currentUserId: string): Promise<User> {
    console.log(`[LeaveUserUseCase] 사용자 탈퇴 처리 실행: id=${id}, currentUserId=${currentUserId}`);

    // 요청자 정보 조회
    const currentUser = await this.userRepo.findById(currentUserId);
    if (!currentUser) {
      throw new EntityNotFoundException('요청자', currentUserId);
    }

    // 대상 사용자 조회
    const targetUser = await this.userRepo.findById(id);
    if (!targetUser) {
      throw new EntityNotFoundException('사용자', id);
    }

    // 권한 검증: 본인만 탈퇴 가능 (관리자는 강제 탈퇴 API를 별도로 사용)
    if (currentUser.id !== id) {
      throw new BusinessRuleException('본인 계정만 탈퇴할 수 있습니다.', 'SELF_OPERATION_ONLY');
    }

    // 이미 탈퇴한 사용자는 처리하지 않음
    if (!targetUser.isActive()) {
      throw new BusinessRuleException('이미 탈퇴한 사용자입니다.');
    }

    return await this.userRepo.softDelete(id);
  }
}
