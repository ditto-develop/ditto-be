import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { IUserProfileRepository } from './user-profile.repository.interface';
import { UserProfile } from '@module/profile/domain/entities/user-profile.entity';

@Injectable()
export class UserProfileRepository implements IUserProfileRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByUserId(userId: string): Promise<UserProfile | null> {
        const row = await this.prisma.userProfile.findUnique({
            where: { userId },
        });

        if (!row) return null;

        return UserProfile.create(
            row.id,
            row.userId,
            row.introduction,
            row.preferredMinAge,
            row.preferredMaxAge,
            row.createdAt,
            row.updatedAt,
        );
    }

    async create(profile: UserProfile): Promise<UserProfile> {
        const row = await this.prisma.userProfile.create({
            data: {
                id: profile.id,
                userId: profile.userId,
                introduction: profile.introduction,
                preferredMinAge: profile.preferredMinAge,
                preferredMaxAge: profile.preferredMaxAge,
            },
        });

        return UserProfile.create(
            row.id,
            row.userId,
            row.introduction,
            row.preferredMinAge,
            row.preferredMaxAge,
            row.createdAt,
            row.updatedAt,
        );
    }

    async update(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
        const row = await this.prisma.userProfile.update({
            where: { userId },
            data: {
                introduction: data.introduction,
                preferredMinAge: data.preferredMinAge,
                preferredMaxAge: data.preferredMaxAge,
            },
        });

        return UserProfile.create(
            row.id,
            row.userId,
            row.introduction,
            row.preferredMinAge,
            row.preferredMaxAge,
            row.createdAt,
            row.updatedAt,
        );
    }

    async upsert(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
        const row = await this.prisma.userProfile.upsert({
            where: { userId },
            create: {
                userId,
                introduction: data.introduction ?? null,
                preferredMinAge: data.preferredMinAge ?? null,
                preferredMaxAge: data.preferredMaxAge ?? null,
            },
            update: {
                introduction: data.introduction,
                preferredMinAge: data.preferredMinAge,
                preferredMaxAge: data.preferredMaxAge,
            },
        });

        return UserProfile.create(
            row.id,
            row.userId,
            row.introduction,
            row.preferredMinAge,
            row.preferredMaxAge,
            row.createdAt,
            row.updatedAt,
        );
    }
}
