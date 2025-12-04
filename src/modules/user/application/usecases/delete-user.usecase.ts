import { BusinessRuleException } from '@common/exceptions/domain.exception';
import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { User } from '@module/user/domain/entities/user.entity';

@Injectable()
export class DeleteUserUseCase {
  constructor(@Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository) {
    console.log('[DeleteUserUseCase] DeleteUserUseCase 초기화');
  }

  async execute(id: string, currentUser: User): Promise<void> {
    console.log(`[DeleteUserUseCase] 사용자 영구 삭제 실행: id=${id}`);

    const targetUser = await this.userRepo.findById(id);
    if (!targetUser) {
      throw new BusinessRuleException('사용자를 찾을 수 없습니다.');
    }

    if (!currentUser.isAdmin()) {
      throw new BusinessRuleException('관리자만 사용자를 삭제할 수 있습니다.');
    }

    if (targetUser.id === currentUser.id) {
      throw new BusinessRuleException('본인을 삭제할 수 없습니다.');
    }

    await this.userRepo.delete(id);
  }
}
