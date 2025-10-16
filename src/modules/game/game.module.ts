import { Module } from '@nestjs/common';
import { GameController } from './presentation/game.controller';
import { JwtTokenModule } from '../../shared/infrastructure/jwt/jwt.token.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from '../../infra/db/entities/game/game.entity';
import { GameAnswerEntity } from '../../infra/db/entities/game/game-answer.entity';
import { GameAnswerOptionEntity } from '../../infra/db/entities/game/game-answer-option.entity';
import { IGameRepositoryToken } from './ports/game.repository';
import { TypeormGameRepository } from './adapters/typeorm-game.repository';
import { CreateGameUseCase } from './application/use-cases/create-game.use-case';
import { LoadAllGamesUseCase } from './application/use-cases/load-all-games.use-case';
import { IGameAnswerRepositoryToken } from './ports/game-answer.repository';
import { TypeormGameAnswerRepository } from './adapters/typeorm-game-answer.repository';
import { SubmitGameAnswerUseCase } from './application/use-cases/submit-game-answer.use-case';
import { GetGameResultKeyUseCase } from './application/use-cases/get-game-result-key.use-case';
import { SetGameResultUseCase } from './application/use-cases/set-game-result.use-case';
import { IGameAnswerCounterToken } from './application/services/counter/game-answer-counter.interface';
import { InMemoryGameAnswerCounter } from './application/services/counter/in-memory-game-answer.counter';

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity, GameAnswerEntity, GameAnswerOptionEntity]), JwtTokenModule],
  controllers: [GameController],
  providers: [
    CreateGameUseCase,
    LoadAllGamesUseCase,
    SubmitGameAnswerUseCase,
    GetGameResultKeyUseCase,
    SetGameResultUseCase,
    { provide: IGameRepositoryToken, useClass: TypeormGameRepository },
    { provide: IGameAnswerRepositoryToken, useClass: TypeormGameAnswerRepository },
    { provide: IGameAnswerCounterToken, useClass: InMemoryGameAnswerCounter },
  ],
  exports: [
    CreateGameUseCase,
    GetGameResultKeyUseCase,
    IGameRepositoryToken,
    IGameAnswerRepositoryToken,
    IGameAnswerCounterToken,
  ],
})
export class GameModule {}
