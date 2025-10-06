import { Module } from '@nestjs/common';
import { MatchController } from './presentation/match.controller';
import { JwtTokenModule } from '../../shared/infrastructure/jwt/jwt.token.module';

@Module({
  imports: [JwtTokenModule],
  controllers: [MatchController],
})
export class MatchModule {}
