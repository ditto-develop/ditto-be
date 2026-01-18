import { Injectable } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { MatchingRecord } from '@module/matching/domain/entities/matching-record.entity';
import { IMatchingRecordRepository } from './matching-record.repository.interface';

@Injectable()
export class MatchingRecordRepository implements IMatchingRecordRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(record: Omit<MatchingRecord, 'id' | 'matchedAt'>): Promise<MatchingRecord> {
    const created = await this.prisma.matchingRecord.create({
      data: {
        userId: record.userId,
        matchedUserId: record.matchedUserId,
        quizSetId: record.quizSetId,
        year: record.year,
        month: record.month,
        week: record.week,
        isMatched: record.isMatched,
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
    });

    return this.toDomain(created);
  }

  async findByUserIdAndYearMonthWeek(
    userId: string,
    year: number,
    month: number,
    week: number,
  ): Promise<MatchingRecord[]> {
    const records = await this.prisma.matchingRecord.findMany({
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
        matchedAt: 'desc',
      },
    });

    return records.map(this.toDomain);
  }

  async findByUserIdAndMatchedUserIdAndYearMonthWeek(
    userId: string,
    matchedUserId: string,
    quizSetId: string,
    year: number,
    month: number,
    week: number,
  ): Promise<MatchingRecord | null> {
    const record = await this.prisma.matchingRecord.findUnique({
      where: {
        userId_matchedUserId_quizSetId_year_month_week: {
          userId,
          matchedUserId,
          quizSetId,
          year,
          month,
          week,
        },
      },
    });

    return record ? this.toDomain(record) : null;
  }

  async updateIsMatched(
    userId: string,
    matchedUserId: string,
    quizSetId: string,
    year: number,
    month: number,
    week: number,
    isMatched: boolean,
  ): Promise<void> {
    // 양방향으로 업데이트 (A→B와 B→A 모두)
    await this.prisma.matchingRecord.updateMany({
      where: {
        OR: [
          {
            userId,
            matchedUserId,
            quizSetId,
            year,
            month,
            week,
          },
          {
            userId: matchedUserId,
            matchedUserId: userId,
            quizSetId,
            year,
            month,
            week,
          },
        ],
      },
      data: {
        isMatched,
      },
    });
  }

  private toDomain(raw: any): MatchingRecord {
    return MatchingRecord.create(
      raw.id,
      raw.userId,
      raw.matchedUserId,
      raw.quizSetId,
      raw.year,
      raw.month,
      raw.week,
      raw.isMatched,
      raw.matchedAt,
    );
  }
}