import { Module } from '@nestjs/common';
import { MatchController } from './presentation/match.controller';
import { JwtTokenModule } from '../../shared/infrastructure/jwt/jwt.token.module';
import { MatchPreloaderService } from './application/preloaders/match-preloader.service';
import { IGameRepositoryToken } from '../game/ports/game.repository';
import { TypeormGameRepository } from '../game/adapters/typeorm-game.repository';
import { GameEntity } from '../../infra/db/entities/game/game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity]), JwtTokenModule],
  controllers: [MatchController],
  providers: [{ provide: IGameRepositoryToken, useClass: TypeormGameRepository }, MatchPreloaderService],
})
export class MatchModule {}
