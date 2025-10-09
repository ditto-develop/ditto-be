import { Module } from '@nestjs/common';
import { GameController } from './presentation/game.controller';
import { JwtTokenModule } from '../../shared/infrastructure/jwt/jwt.token.module';

@Module({
  imports: [JwtTokenModule],
  controllers: [GameController],
})
export class GameModule {}
