import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../infra/db/entities/user.entity';
import { UsersController } from './presentation/users.controller';
import { JwtTokenModule } from '../../shared/infrastructure/jwt/jwt.token.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), JwtTokenModule],
  controllers: [UsersController],
})
export class UsersModule {}
