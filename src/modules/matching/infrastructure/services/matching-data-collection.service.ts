import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { MatchingRedisService } from './matching-redis.service';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import {
  IUserQuizProgressRepository,
  USER_QUIZ_PROGRESS_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/user-quiz-progress.repository.interface';
import {
  IUserRepository,
  USER_REPOSITORY_TOKEN,
} from '@module/user/infrastructure/repository/user.repository.interface';

@Injectable()
export class MatchingDataCollectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchingRedisService: MatchingRedisService,
    private readonly systemStateService: SystemStateService,
    @Inject(USER_QUIZ_PROGRESS_REPOSITORY_TOKEN)
    private readonly userQuizProgressRepository: IUserQuizProgressRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * 퀴즈 세트의 완료한 사용자 답안 데이터를 수집하여 Redis에 저장
   */
  async collectAndStoreUserAnswers(quizSetId: string): Promise<number> {
    // 1. 완료한 사용자 목록 조회
    const currentYear = await this.systemStateService.getCurrentYear();
    const currentMonth = await this.systemStateService.getCurrentMonth();
    const currentWeek = await this.systemStateService.getCurrentWeek();

    const completedUserIds = await this.userQuizProgressRepository.findCompletedUsersByQuizSetId(
      quizSetId,
      currentYear,
      currentMonth,
      currentWeek,
    );

    if (completedUserIds.length === 0) {
      return 0;
    }

    let collectedCount = 0;

    // 2. 각 사용자에 대해 답안 데이터 수집 및 비트마스크 생성
    for (const userId of completedUserIds) {
      try {
        // 사용자 정보 조회 (gender 포함)
        const user = await this.userRepository.findById(userId);
        if (!user) {
          console.warn(`사용자를 찾을 수 없음: ${userId}`);
          continue;
        }

        // 사용자의 답안 조회 (choice 정보 포함)
        const answers = await this.prisma.quizAnswer.findMany({
          where: {
            userId,
            quiz: {
              quizSetId,
            },
          },
          include: {
            choice: {
              select: {
                order: true,
              },
            },
          },
          orderBy: {
            quiz: {
              order: 'asc',
            },
          },
        });

        if (answers.length !== 12) {
          console.warn(`답안 개수가 12개가 아님 (사용자: ${userId}, 답안 수: ${answers.length})`);
          continue;
        }

        // 비트마스크 생성 (Choice.order 값들을 순서대로 이어붙임)
        const bitmaskArray: number[] = answers.map(answer => answer.choice.order);
        const bitmaskString = bitmaskArray.join('');

        // Redis에 저장
        await this.matchingRedisService.storeUserAnswers(
          quizSetId,
          userId,
          bitmaskString, // 문자열로 저장
          user.gender,
        );

        collectedCount++;
      } catch (error) {
        console.error(`사용자 답안 데이터 수집 실패 (사용자: ${userId}):`, error);
      }
    }

    return collectedCount;
  }
}