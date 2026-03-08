import { Inject, Injectable } from '@nestjs/common';
import {
    IUserProfileRepository,
    USER_PROFILE_REPOSITORY_TOKEN,
} from '@module/profile/infrastructure/repository/user-profile.repository.interface';
import { UserProfile } from '@module/profile/domain/entities/user-profile.entity';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetMyProfileUseCase {
    constructor(
        @Inject(USER_PROFILE_REPOSITORY_TOKEN) private readonly profileRepo: IUserProfileRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) {
        this.logger.log('GetMyProfileUseCase 초기화', 'Profile:GetMyProfileUseCase');
    }

    async execute(userId: string): Promise<UserProfile> {
        this.logger.log('본인 프로필 조회', 'Profile:GetMyProfileUseCase', { userId });

        let profile = await this.profileRepo.findByUserId(userId);

        // 프로필이 없으면 빈 프로필 자동 생성
        if (!profile) {
            this.logger.log('프로필 미존재 — 빈 프로필 자동 생성', 'Profile:GetMyProfileUseCase', { userId });
            profile = await this.profileRepo.upsert(userId, {});
        }

        return profile;
    }
}
