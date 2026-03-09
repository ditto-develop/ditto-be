import { Inject, Injectable } from '@nestjs/common';
import {
    IUserProfileRepository,
    USER_PROFILE_REPOSITORY_TOKEN,
} from '@module/profile/infrastructure/repository/user-profile.repository.interface';
import {
    IUserRepository,
    USER_REPOSITORY_TOKEN,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { PublicProfileDto } from '@module/profile/application/dto/public-profile.dto';
import { EntityNotFoundException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetUserProfileUseCase {
    constructor(
        @Inject(USER_PROFILE_REPOSITORY_TOKEN) private readonly profileRepo: IUserProfileRepository,
        @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) {
        this.logger.log('GetUserProfileUseCase 초기화', 'Profile:GetUserProfileUseCase');
    }

    async execute(targetUserId: string): Promise<PublicProfileDto> {
        this.logger.log('타인 프로필 조회', 'Profile:GetUserProfileUseCase', { targetUserId });

        // 대상 사용자 존재 및 활성 상태 확인
        const user = await this.userRepo.findById(targetUserId);
        if (!user || !user.isActive()) {
            throw new EntityNotFoundException('사용자', targetUserId);
        }

        // 프로필 조회
        const profile = await this.profileRepo.findByUserId(targetUserId);

        // 공개 정보만 응답
        const publicProfile = new PublicProfileDto();
        publicProfile.userId = user.id;
        publicProfile.nickname = user.nickname;
        publicProfile.gender = user.gender;
        publicProfile.age = user.age;
        publicProfile.introduction = profile?.introduction ?? null;
        publicProfile.profileImageUrl = profile?.profileImageUrl ?? null;
        publicProfile.location = profile?.location ?? null;
        publicProfile.preferredMinAge = profile?.preferredMinAge ?? null;
        publicProfile.preferredMaxAge = profile?.preferredMaxAge ?? null;

        return publicProfile;
    }
}
