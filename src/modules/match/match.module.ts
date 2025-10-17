import { Module } from '@nestjs/common';
import { MatchController } from './presentation/match.controller';
import { JwtTokenModule } from '../../shared/infrastructure/jwt/jwt.token.module';
import { MatchPreloaderService } from './application/preloaders/match-preloader.service';
import { GameEntity } from '../../infra/db/entities/game/game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameAnswerEntity } from '../../infra/db/entities/game/game-answer.entity';
import { GameModule } from '../game/game.module';
import { CountSimilarUseCase } from './application/use-cases/count-similar.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity, GameAnswerEntity]), JwtTokenModule, GameModule],
  controllers: [MatchController],
  providers: [MatchPreloaderService, CountSimilarUseCase],
})
export class MatchModule {}
