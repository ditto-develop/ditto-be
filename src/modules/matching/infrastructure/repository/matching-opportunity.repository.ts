import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { MatchingOpportunity } from '@module/matching/domain/entities/matching-opportunity.entity';
import { IMatchingOpportunityRepository } from './matching-opportunity.repository.interface';

// MatchingOpportunity with relations
export type MatchingOpportunityWithRelations = Prisma.MatchingOpportunityGetPayload<{
  include: {
    matchedUser: {
      select: { id: true; nickname: true; gender: true };
    };
    quizSet: {
      select: { id: true; title: true; category: true };
    };
  };
}>;

// Basic MatchingOpportunity from Prisma (without relations)
export type MatchingOpportunityBasic = Prisma.MatchingOpportunityGetPayload<{}>;

@Injectable()
export class MatchingOpportunityRepository implements IMatchingOpportunityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(opportunities: Omit<MatchingOpportunity, 'id' | 'createdAt'>[]): Promise<void> {
    if (opportunities.length === 0) return;

    const data = opportunities.map(opp => ({
      userId: opp.userId,
      matchedUserId: opp.matchedUserId,
      quizSetId: opp.quizSetId,
      year: opp.year,
      month: opp.month,
      week: opp.week,
      matchScore: opp.matchScore,
    }));

    await this.prisma.matchingOpportunity.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findByUserIdAndYearMonthWeek(
    userId: string,
    year: number,
    month: number,
    week: number,
  ): Promise<MatchingOpportunity[]> {
    const opportunities = await this.prisma.matchingOpportunity.findMany({
      where: {
        userId,
        year,
        month,
        week,
      },
      orderBy: {
        matchScore: 'desc',
      },
    });

    return opportunities.map(this.toDomain);
  }

  async findByUserIdAndYearMonthWeekWithRelations(
    userId: string,
    year: number,
    month: number,
    week: number,
  ): Promise<MatchingOpportunityWithRelations[]> {
    const opportunities = await this.prisma.matchingOpportunity.findMany({
      where: {
        userId,
        year,
        month,
        week,
      },
      include: {
        matchedUser: {
          select: {
            id: true,
            nickname: true,
            gender: true,
          },
        },
        quizSet: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
      orderBy: {
        matchScore: 'desc',
      },
    });

    return opportunities;
  }

  async existsByQuizSetId(quizSetId: string): Promise<boolean> {
    const count = await this.prisma.matchingOpportunity.count({
      where: { quizSetId },
    });
    return count > 0;
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.prisma.matchingOpportunity.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
      },
    });
    return result.count;
  }

  private toDomain(raw: MatchingOpportunityBasic): MatchingOpportunity {
    return MatchingOpportunity.create(
      raw.id,
      raw.userId,
      raw.matchedUserId,
      raw.quizSetId,
      raw.year,
      raw.month,
      raw.week,
      raw.matchScore,
      raw.createdAt,
    );
  }
}