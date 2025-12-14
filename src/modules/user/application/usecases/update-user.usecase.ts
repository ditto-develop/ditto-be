import { BusinessRuleException, EntityNotFoundException } from '@common/exceptions/domain.exception';
import { Inject, Injectable } from '@nestjs/common';
import { User, UserUpdateProps } from '@module/user/domain/entities/user.entity';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { UpdateUserDto } from '@module/user/application/dto/user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(@Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository) {
    console.log('[UpdateUserUseCase] UpdateUserUseCase 초기화');
  }

  async execute(id: string, dto: UpdateUserDto, currentUserId: string): Promise<User> {
    console.log(`[UpdateUserUseCase] 사용자 정보 수정 실행: id=${id}, currentUserId=${currentUserId}`);

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

    // 권한 검증: 관리자이거나 본인만 수정 가능
    if (!targetUser.canBeModifiedBy(currentUser)) {
      throw new BusinessRuleException('수정 권한이 없습니다.', 'INSUFFICIENT_PERMISSIONS');
    }

    // 권한 검증 및 데이터 준비
    const updateData: UserUpdateProps = {};

    if (dto.name !== undefined) {
      if (!targetUser.canModify('name', currentUser)) {
        throw new BusinessRuleException('이름을 수정할 권한이 없습니다.');
      }
      updateData.name = dto.name;
    }

    if (dto.nickname !== undefined) {
      if (!targetUser.canModify('nickname', currentUser)) {
        throw new BusinessRuleException('닉네임을 수정할 권한이 없습니다.');
      }
      updateData.nickname = dto.nickname;
    }

    if (dto.phoneNumber !== undefined) {
      if (!targetUser.canModify('phoneNumber', currentUser)) {
        throw new BusinessRuleException('전화번호를 수정할 권한이 없습니다.');
      }
      // 중복 검증
      const existingUser = await this.userRepo.findByPhoneNumber(dto.phoneNumber);
      if (existingUser && existingUser.id !== id) {
        throw new BusinessRuleException('이미 존재하는 전화번호입니다.');
      }
      updateData.phoneNumber = dto.phoneNumber;
    }

    if (dto.email !== undefined) {
      if (!targetUser.canModify('email', currentUser)) {
        throw new BusinessRuleException('이메일을 수정할 권한이 없습니다.');
      }
      // 중복 검증
      const existingUser = await this.userRepo.findByEmail(dto.email);
      if (existingUser && existingUser.id !== id) {
        throw new BusinessRuleException('이미 존재하는 이메일입니다.');
      }
      updateData.email = dto.email;
    }

    // 도메인 엔티티의 update 메서드를 사용하여 새로운 인스턴스 생성
    const updatedUser = targetUser.update(updateData);

    // 유효성 검증
    updatedUser.validate();

    // Repository를 통해 저장 (실제로는 도메인 객체를 저장하지만, 여기서는 DB 업데이트)
    return await this.userRepo.update(id, updateData);
  }
}
