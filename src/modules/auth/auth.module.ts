import { Module } from '@nestjs/common';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { JwtTokenModule } from '../../shared/infrastructure/jwt/jwt.token.module';

@Module({
  imports: [JwtTokenModule],
  providers: [LoginUserUseCase],
  exports: [LoginUserUseCase],
})
export class AuthModule {}
