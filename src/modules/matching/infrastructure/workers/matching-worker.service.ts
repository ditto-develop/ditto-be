import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RunMatchingAlgorithmUseCase } from '@module/matching/application/usecases/run-matching-algorithm.usecase';

export interface MatchingJobData {
  quizSetId: string;
}

@Injectable()
@Processor('matching')
export class MatchingWorker extends WorkerHost {
  private readonly logger = new Logger(MatchingWorker.name);

  constructor(
    private readonly runMatchingAlgorithmUseCase: RunMatchingAlgorithmUseCase,
  ) {
    super();
  }

  async process(job: Job<MatchingJobData>): Promise<void> {
    const { quizSetId } = job.data;

    this.logger.log(`매칭 알고리즘 작업 시작: ${quizSetId}`, MatchingWorker.name);

    try {
      // 매칭 알고리즘 실행
      await this.runMatchingAlgorithmUseCase.execute(quizSetId);

      this.logger.log(`매칭 알고리즘 작업 완료: ${quizSetId}`, MatchingWorker.name);

    } catch (error) {
      this.logger.error(
        `매칭 알고리즘 작업 실패: ${quizSetId}`,
        error instanceof Error ? error.stack : String(error),
        MatchingWorker.name,
      );
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<MatchingJobData>) {
    const { quizSetId } = job.data;
    this.logger.log(`매칭 알고리즘 작업 성공적으로 완료: ${quizSetId}`, MatchingWorker.name);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<MatchingJobData>, error: Error) {
    const { quizSetId } = job.data;
    this.logger.error(
      `매칭 알고리즘 작업 실패: ${quizSetId}`,
      error.stack,
      MatchingWorker.name,
    );
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: number, _prev: string) {
    this.logger.warn(`매칭 알고리즘 작업 정체 감지: ${jobId}`, MatchingWorker.name);
  }
}