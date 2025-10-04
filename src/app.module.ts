import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/infrastructure/typeorm/database.module';
import { JwtTokenModule } from './shared/infrastructure/jwt/jwt.token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    JwtTokenModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
