import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { IRatingRepository } from './rating.repository.interface';
import { UserRating } from '@module/rating/domain/entities/user-rating.entity';

@Injectable()
export class RatingRepository implements IRatingRepository {
    constructor(private readonly prisma: PrismaService) { }

    private toDomain(row: any): UserRating {
        return new UserRating(
            row.id, row.matchRequestId, row.fromUserId, row.toUserId,
            row.score, row.comment, row.createdAt, row.updatedAt,
        );
    }

    async create(rating: UserRating): Promise<UserRating> {
        const row = await this.prisma.userRating.create({
            data: {
                id: rating.id,
                matchRequestId: rating.matchRequestId,
                fromUserId: rating.fromUserId,
                toUserId: rating.toUserId,
                score: rating.score,
                comment: rating.comment,
            },
        });
        return this.toDomain(row);
    }

    async findById(id: string): Promise<UserRating | null> {
        const row = await this.prisma.userRating.findUnique({ where: { id } });
        return row ? this.toDomain(row) : null;
    }

    async findByMatchRequestAndUser(matchRequestId: string, fromUserId: string): Promise<UserRating | null> {
        const row = await this.prisma.userRating.findUnique({
            where: { matchRequestId_fromUserId: { matchRequestId, fromUserId } },
        });
        return row ? this.toDomain(row) : null;
    }

    async findByTargetUser(toUserId: string): Promise<UserRating[]> {
        const rows = await this.prisma.userRating.findMany({
            where: { toUserId },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((r) => this.toDomain(r));
    }

    async countByTargetUser(toUserId: string): Promise<number> {
        return this.prisma.userRating.count({ where: { toUserId } });
    }
}
