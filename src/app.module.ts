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
import { APP_FILTER } from '@nestjs/core';
import { UsersModule } from './modules/user/users.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

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
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
