import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { IMatchRequestRepository } from './match-request.repository.interface';
import {
    MatchRequest,
    MatchRequestStatus,
    ScoreBreakdown,
} from '@module/matching/domain/entities/match-request.entity';

@Injectable()
export class MatchRequestRepository implements IMatchRequestRepository {
    constructor(private readonly prisma: PrismaService) { }

    private toDomain(row: any): MatchRequest {
        return new MatchRequest(
            row.id,
            row.quizSetId,
            row.fromUserId,
            row.toUserId,
            row.status as MatchRequestStatus,
            row.score,
            row.scoreBreakdown as ScoreBreakdown | null,
            row.algorithmVersion,
            row.requestedAt,
            row.respondedAt,
            row.createdAt,
            row.updatedAt,
        );
    }

    async create(request: MatchRequest): Promise<MatchRequest> {
        const row = await this.prisma.matchRequest.create({
            data: {
                id: request.id,
                quizSetId: request.quizSetId,
                fromUserId: request.fromUserId,
                toUserId: request.toUserId,
                status: request.status,
                score: request.score,
                scoreBreakdown: request.scoreBreakdown as any,
                algorithmVersion: request.algorithmVersion,
                requestedAt: request.requestedAt,
                respondedAt: request.respondedAt,
            },
        });
        return this.toDomain(row);
    }

    async findById(id: string): Promise<MatchRequest | null> {
        const row = await this.prisma.matchRequest.findUnique({ where: { id } });
        return row ? this.toDomain(row) : null;
    }

    async findByQuizSetAndUsers(
        quizSetId: string, fromUserId: string, toUserId: string,
    ): Promise<MatchRequest | null> {
        const row = await this.prisma.matchRequest.findUnique({
            where: {
                quizSetId_fromUserId_toUserId: { quizSetId, fromUserId, toUserId },
            },
        });
        return row ? this.toDomain(row) : null;
    }

    async findByUserAndQuizSet(userId: string, quizSetId: string): Promise<MatchRequest[]> {
        const rows = await this.prisma.matchRequest.findMany({
            where: {
                quizSetId,
                OR: [{ fromUserId: userId }, { toUserId: userId }],
            },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((r) => this.toDomain(r));
    }

    async findSentByUser(userId: string, quizSetId?: string): Promise<MatchRequest[]> {
        const rows = await this.prisma.matchRequest.findMany({
            where: { fromUserId: userId, status: 'PENDING', ...(quizSetId ? { quizSetId } : {}) },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((r) => this.toDomain(r));
    }

    async findReceivedByUser(userId: string, quizSetId?: string): Promise<MatchRequest[]> {
        const rows = await this.prisma.matchRequest.findMany({
            where: { toUserId: userId, status: 'PENDING', ...(quizSetId ? { quizSetId } : {}) },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((r) => this.toDomain(r));
    }

    async updateStatus(id: string, status: MatchRequestStatus, respondedAt?: Date): Promise<MatchRequest> {
        const row = await this.prisma.matchRequest.update({
            where: { id },
            data: { status, respondedAt: respondedAt ?? new Date() },
        });
        return this.toDomain(row);
    }

    async findAcceptedMatch(userId: string, quizSetId: string): Promise<MatchRequest | null> {
        const row = await this.prisma.matchRequest.findFirst({
            where: {
                quizSetId,
                status: 'ACCEPTED',
                OR: [{ fromUserId: userId }, { toUserId: userId }],
            },
        });
        return row ? this.toDomain(row) : null;
    }

    async hasAcceptedMatch(userId: string, quizSetId: string): Promise<boolean> {
        const count = await this.prisma.matchRequest.count({
            where: {
                quizSetId,
                status: 'ACCEPTED',
                OR: [{ fromUserId: userId }, { toUserId: userId }],
            },
        });
        return count > 0;
    }
}
