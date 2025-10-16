import { Module } from '@nestjs/common';
import { MatchController } from './presentation/match.controller';
import { JwtTokenModule } from '../../shared/infrastructure/jwt/jwt.token.module';
import { MatchPreloaderService } from './application/preloaders/match-preloader.service';
import { GameEntity } from '../../infra/db/entities/game/game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameAnswerEntity } from '../../infra/db/entities/game/game-answer.entity';
import { GameModule } from '../game/game.module';

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity, GameAnswerEntity]), JwtTokenModule, GameModule],
  controllers: [MatchController],
  providers: [MatchPreloaderService],
})
export class MatchModule {}
