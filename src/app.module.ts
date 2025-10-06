import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/infrastructure/typeorm/database.module';
import { JwtTokenModule } from './shared/infrastructure/jwt/jwt.token.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { GameModule } from './modules/game/game.module';
import { MatchModule } from './modules/match/match.module';
import { ReferralModule } from './modules/referral/referral.module';
import { UsersModule } from './modules/user/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    JwtTokenModule,
    AuthModule,
    UsersModule,
    EmailModule,
    GameModule,
    MatchModule,
    ReferralModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
