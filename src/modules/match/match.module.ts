import { Module } from '@nestjs/common';
import { MatchController } from './presentation/match.controller';
import { JwtTokenModule } from '../../shared/infrastructure/jwt/jwt.token.module';
import { MatchPreloaderService } from './application/preloaders/match-preloader.service';
import { GameEntity } from '../../infra/db/entities/game/game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IGameAnswerRepositoryToken } from '../game/ports/game-answer.repository';
import { TypeormGameAnswerRepository } from '../game/adapters/typeorm-game-answer.repository';
import { GameAnswerEntity } from '../../infra/db/entities/game/game-answer.entity';
import { TypeormGameRepository } from '../game/adapters/typeorm-game.repository';
import { IGameRepositoryToken } from '../game/ports/game.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity, GameAnswerEntity]), JwtTokenModule],
  controllers: [MatchController],
  providers: [
    { provide: IGameRepositoryToken, useClass: TypeormGameRepository },
    { provide: IGameAnswerRepositoryToken, useClass: TypeormGameAnswerRepository },
    MatchPreloaderService,
  ],
})
export class MatchModule {}
