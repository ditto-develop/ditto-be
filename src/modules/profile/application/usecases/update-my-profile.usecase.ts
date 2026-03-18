import { Inject, Injectable } from '@nestjs/common';
import {
    IUserProfileRepository,
    USER_PROFILE_REPOSITORY_TOKEN,
} from '@module/profile/infrastructure/repository/user-profile.repository.interface';
import {
    IUserRepository,
    USER_REPOSITORY_TOKEN,
} from '@module/user/infrastructure/repository/user.repository.interface';
import { UserProfile } from '@module/profile/domain/entities/user-profile.entity';
import { UpdateProfileDto } from '@module/profile/application/dto/update-profile.dto';
import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class UpdateMyProfileUseCase {
    constructor(
        @Inject(USER_PROFILE_REPOSITORY_TOKEN) private readonly profileRepo: IUserProfileRepository,
        @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) {
        this.logger.log('UpdateMyProfileUseCase 초기화', 'Profile:UpdateMyProfileUseCase');
    }

    async execute(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
        this.logger.log('프로필 수정 실행', 'Profile:UpdateMyProfileUseCase', { userId, dto });

        // 사용자 존재 & 탈퇴 여부 확인
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new EntityNotFoundException('사용자', userId);
        }
        if (!user.isActive()) {
            throw new BusinessRuleException('탈퇴한 사용자는 프로필을 수정할 수 없습니다.');
        }

        // min > max 비즈니스 검증 (DTO validator 통과 후 cross-field 검증)
        const existingProfile = await this.profileRepo.findByUserId(userId);
        const effectiveMin = dto.preferredMinAge !== undefined ? dto.preferredMinAge : existingProfile?.preferredMinAge ?? null;
        const effectiveMax = dto.preferredMaxAge !== undefined ? dto.preferredMaxAge : existingProfile?.preferredMaxAge ?? null;

        if (effectiveMin !== null && effectiveMax !== null && effectiveMin > effectiveMax) {
            throw new BusinessRuleException('선호 최소 나이는 최대 나이보다 작거나 같아야 합니다.');
        }

        // upsert (프로필 없으면 생성, 있으면 수정)
        const profile = await this.profileRepo.upsert(userId, {
            introduction: dto.introduction,
            profileImageUrl: dto.profileImageUrl,
            location: dto.location,
            occupation: dto.occupation,
            interests: dto.interests,
            preferredMinAge: dto.preferredMinAge,
            preferredMaxAge: dto.preferredMaxAge,
        } as Partial<UserProfile>);

        this.logger.log('프로필 수정 완료', 'Profile:UpdateMyProfileUseCase', { userId, profileId: profile.id });
        return profile;
    }
}
