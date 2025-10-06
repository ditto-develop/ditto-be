import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../infra/db/entities/user.entity';
import { UsersController } from './presentation/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { TypeormUserRepository } from './adapters/typeorm-user.repository';
import { IUserRepositoryToken } from './ports/user.repository';
import { JwtTokenModule } from '../../shared/infrastructure/jwt/jwt.token.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), JwtTokenModule],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    { provide: IUserRepositoryToken, useClass: TypeormUserRepository },
  ],
})
export class UsersModule {}
