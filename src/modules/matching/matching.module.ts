import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { BullModule } from '@nestjs/bullmq';
import { CommonModule } from '@module/common/common.module';
import { RedisModule } from '@module/common/redis/redis.module';
import { QuizModule } from '@module/quiz/quiz.module';
import { UserModule } from '@module/user/user.module';

// Domain
import { MatchingOpportunity } from './domain/entities/matching-opportunity.entity';
import { MatchingRecord } from './domain/entities/matching-record.entity';

// Application Services
import { MatchingAlgorithmService } from './application/services/matching-algorithm.service';
import { MatchingDataCollectionService } from './infrastructure/services/matching-data-collection.service';
import { MATCHING_NOTIFICATION_SERVICE_TOKEN, IMatchingNotificationService } from './application/services/matching-notification.service.interface';

// UseCases
import { RunMatchingAlgorithmUseCase } from './application/usecases/run-matching-algorithm.usecase';
import { GetMatchingOpportunitiesUseCase } from './application/usecases/get-matching-opportunities.usecase';
import { CreateMatchingRecordUseCase } from './application/usecases/create-matching-record.usecase';
import { GetMatchingRecordsUseCase } from './application/usecases/get-matching-records.usecase';
import { RetryMatchingAlgorithmUseCase } from './application/usecases/retry-matching-algorithm.usecase';

// Infrastructure
import { MatchingRedisService } from './infrastructure/services/matching-redis.service';
import { MatchingWorker } from './infrastructure/workers/matching-worker.service';
import { MatchingScheduler } from './infrastructure/schedulers/matching-scheduler.service';
import { MATCHING_OPPORTUNITY_REPOSITORY_TOKEN } from './infrastructure/repository/matching-opportunity.repository.interface';
import { MATCHING_RECORD_REPOSITORY_TOKEN } from './infrastructure/repository/matching-record.repository.interface';
import { MatchingOpportunityRepository } from './infrastructure/repository/matching-opportunity.repository';
import { MatchingRecordRepository } from './infrastructure/repository/matching-record.repository';

// Presentation
import { MatchingController } from './presentation/controller/matching.controller';
import { RunMatchingAlgorithmHandler } from './presentation/commands/handlers/run-matching-algorithm.handler';
import { GetMatchingOpportunitiesHandler } from './presentation/commands/handlers/get-matching-opportunities.handler';
import { CreateMatchingRecordHandler } from './presentation/commands/handlers/create-matching-record.handler';
import { GetMatchingRecordsHandler } from './presentation/commands/handlers/get-matching-records.handler';
import { RetryMatchingAlgorithmHandler } from './presentation/commands/handlers/retry-matching-algorithm.handler';

const MatchingOpportunityRepositoryProvider = {
  provide: MATCHING_OPPORTUNITY_REPOSITORY_TOKEN,
  useClass: MatchingOpportunityRepository,
};

const MatchingRecordRepositoryProvider = {
  provide: MATCHING_RECORD_REPOSITORY_TOKEN,
  useClass: MatchingRecordRepository,
};

// 매칭 성사 알림 서비스의 빈 구현체 (추후 확장)
const MatchingNotificationServiceProvider = {
  provide: MATCHING_NOTIFICATION_SERVICE_TOKEN,
  useClass: class implements IMatchingNotificationService {
    private readonly logger = new Logger('MatchingNotificationService');

    async notifyMatchingSuccess(userId: string, matchedUserId: string, quizSetId: string): Promise<void> {
      // TODO: 실제 알림 로직 구현 (푸시 알림, 이메일 등)
      this.logger.log(`매칭 성사 알림: ${userId} ↔ ${matchedUserId} (퀴즈 세트: ${quizSetId})`);
    }
  },
};

@Module({
  imports: [
    CommandBusModule,
    CommonModule,
    RedisModule,
    QuizModule,
    UserModule,
    BullModule.registerQueue({
      name: 'matching',
      defaultJobOptions: {
        attempts: 3, // 최대 3회 재시도
        backoff: {
          type: 'fixed',
          delay: 180000, // 3분 간격
        },
        removeOnComplete: true,
        removeOnFail: false, // 실패한 작업은 보관 (수동 재실행용)
      },
    }),
  ],
  controllers: [MatchingController],
  providers: [
    // Domain Entities (for dependency injection if needed)
    { provide: MatchingOpportunity, useValue: MatchingOpportunity },
    { provide: MatchingRecord, useValue: MatchingRecord },

    // Application Services
    MatchingAlgorithmService,
    MatchingDataCollectionService,
    MatchingNotificationServiceProvider,

    // UseCases
    RunMatchingAlgorithmUseCase,
    GetMatchingOpportunitiesUseCase,
    CreateMatchingRecordUseCase,
    GetMatchingRecordsUseCase,
    RetryMatchingAlgorithmUseCase,

    // Infrastructure
    MatchingRedisService,
    MatchingWorker,
    MatchingScheduler,
    MatchingOpportunityRepositoryProvider,
    MatchingRecordRepositoryProvider,

    // Presentation (Command Handlers)
    RunMatchingAlgorithmHandler,
    GetMatchingOpportunitiesHandler,
    CreateMatchingRecordHandler,
    GetMatchingRecordsHandler,
    RetryMatchingAlgorithmHandler,
  ],
  exports: [
    MATCHING_OPPORTUNITY_REPOSITORY_TOKEN,
    MATCHING_RECORD_REPOSITORY_TOKEN,
    MATCHING_NOTIFICATION_SERVICE_TOKEN,
  ],
})
export class MatchingModule implements OnModuleInit {
  private readonly logger = new Logger(MatchingModule.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly runMatchingAlgorithmHandler: RunMatchingAlgorithmHandler,
    private readonly getMatchingOpportunitiesHandler: GetMatchingOpportunitiesHandler,
    private readonly createMatchingRecordHandler: CreateMatchingRecordHandler,
    private readonly getMatchingRecordsHandler: GetMatchingRecordsHandler,
    private readonly retryMatchingAlgorithmHandler: RetryMatchingAlgorithmHandler,
  ) {
    this.logger.log('MatchingModule 초기화');
  }

  onModuleInit(): void {
    registerCommandHandlers(
      this.commandBus,
      [
        { handler: this.runMatchingAlgorithmHandler, class: RunMatchingAlgorithmHandler },
        { handler: this.getMatchingOpportunitiesHandler, class: GetMatchingOpportunitiesHandler },
        { handler: this.createMatchingRecordHandler, class: CreateMatchingRecordHandler },
        { handler: this.getMatchingRecordsHandler, class: GetMatchingRecordsHandler },
        { handler: this.retryMatchingAlgorithmHandler, class: RetryMatchingAlgorithmHandler },
      ],
      'MatchingModule',
    );
  }
}