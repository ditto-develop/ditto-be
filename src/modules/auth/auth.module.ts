import { Module } from '@nestjs/common';
import { JwtTokenModule } from '../../shared/infrastructure/jwt/jwt.token.module';

@Module({
  imports: [JwtTokenModule],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
