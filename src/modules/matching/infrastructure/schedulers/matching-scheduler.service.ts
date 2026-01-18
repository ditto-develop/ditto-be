import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IMatchingOpportunityRepository, MATCHING_OPPORTUNITY_REPOSITORY_TOKEN } from '../repository/matching-opportunity.repository.interface';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import { IQuizSetRepository, QUIZ_SET_REPOSITORY_TOKEN } from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';

@Injectable()
export class MatchingScheduler {
  private readonly logger = new Logger(MatchingScheduler.name);

  constructor(
    @InjectQueue('matching') private readonly matchingQueue: Queue,
    @Inject(MATCHING_OPPORTUNITY_REPOSITORY_TOKEN)
    private readonly matchingOpportunityRepository: IMatchingOpportunityRepository,
    private readonly systemStateService: SystemStateService,
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {}

  /**
   * 매주 목요일 00시에 매칭 알고리즘 트리거
   * 현재 주차의 모든 활성 퀴즈 세트에 대해 실행
   */
  @Cron('0 0 * * 4') // 매주 목요일 자정
  async triggerMatchingAlgorithm() {
    this.logger.log('매칭 알고리즘 스케줄러 시작', MatchingScheduler.name);

    try {
      // 현재 주차의 모든 활성 퀴즈 세트 조회
      // TODO: 실제로는 QuizSetRepository를 통해 활성 퀴즈 세트 조회
      const activeQuizSets = await this.getActiveQuizSetsForCurrentWeek();

      this.logger.log(`${activeQuizSets.length}개의 퀴즈 세트에 대해 매칭 알고리즘 실행 예정`, MatchingScheduler.name);

      for (const quizSet of activeQuizSets) {
        try {
          // 이미 매칭 기회가 생성된 퀴즈 세트는 스킵
          const hasOpportunities = await this.matchingOpportunityRepository.existsByQuizSetId(quizSet.id);

          if (hasOpportunities) {
            this.logger.warn(`퀴즈 세트 ${quizSet.id}는 이미 매칭 기회가 생성되어 스킵합니다.`);
            continue;
          }

          // 큐에 작업 추가
          await this.matchingQueue.add(
            'run-algorithm',
            { quizSetId: quizSet.id },
            {
              attempts: 3, // 최대 3회 재시도
              backoff: {
                type: 'fixed',
                delay: 180000, // 3분 간격
              },
              removeOnComplete: true,
              removeOnFail: false, // 실패한 작업은 보관
            }
          );

          this.logger.log(`퀴즈 세트 ${quizSet.id}의 매칭 알고리즘 작업이 큐에 추가되었습니다.`, MatchingScheduler.name);

        } catch (error) {
          this.logger.error(
            `퀴즈 세트 ${quizSet.id}의 매칭 알고리즘 작업 추가 실패`,
            error instanceof Error ? error.stack : String(error),
            MatchingScheduler.name,
          );
        }
      }

    } catch (error) {
      this.logger.error(
        '매칭 알고리즘 스케줄러 실행 실패',
        error instanceof Error ? error.stack : String(error),
        MatchingScheduler.name,
      );
    }
  }

  /**
   * 매일 새벽 2시에 14일 경과된 매칭 기회 삭제
   */
  @Cron('0 2 * * *') // 매일 새벽 2시
  async cleanupOldMatchingOpportunities() {
    this.logger.log('매칭 기회 정리 작업 시작', MatchingScheduler.name);

    try {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const deletedCount = await this.matchingOpportunityRepository.deleteOlderThan(fourteenDaysAgo);

      this.logger.log(`14일 경과된 매칭 기회 ${deletedCount}개 삭제 완료`, MatchingScheduler.name);

    } catch (error) {
      this.logger.error(
        '매칭 기회 정리 작업 실패',
        error instanceof Error ? error.stack : String(error),
        MatchingScheduler.name,
      );
    }
  }

  /**
   * 현재 주차의 활성 퀴즈 세트 조회
   */
  private async getActiveQuizSetsForCurrentWeek(): Promise<Array<{ id: string; title: string }>> {
    try {
      // 현재 주차 정보 조회
      const year = await this.systemStateService.getCurrentYear();
      const month = await this.systemStateService.getCurrentMonth();
      const week = await this.systemStateService.getCurrentWeek();

      // 현재 주차의 활성 퀴즈 세트 조회
      const activeQuizSets = await this.quizSetRepository.findByFilters(
        year,
        month,
        week,
        undefined, // category 필터 없음
        true, // isActive = true
      );

      return activeQuizSets.map(quizSet => ({
        id: quizSet.id,
        title: quizSet.title,
      }));
    } catch (error) {
      this.logger.error(
        '활성 퀴즈 세트 조회 실패',
        error instanceof Error ? error.stack : String(error),
        MatchingScheduler.name,
      );
      // 에러 발생 시 빈 배열 반환
      return [];
    }
  }
}