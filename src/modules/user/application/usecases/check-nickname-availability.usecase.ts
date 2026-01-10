import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';

@Injectable()
export class CheckNicknameAvailabilityUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
  ) {
    console.log('[CheckNicknameAvailabilityUseCase] CheckNicknameAvailabilityUseCase 초기화');
  }

  async execute(nickname: string): Promise<{ available: boolean }> {
    console.log(`[CheckNicknameAvailabilityUseCase] 닉네임 사용 가능 여부 확인: nickname=${nickname}`);

    const existingUser = await this.userRepo.findByNickname(nickname);
    const available = !existingUser;

    console.log(`[CheckNicknameAvailabilityUseCase] 닉네임 사용 가능 여부: ${available}`);
    return { available };
  }
}