import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../infra/db/entities/user/user.entity';
import { UsersController } from './presentation/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { TypeormUserRepository } from './adapters/typeorm-user.repository';
import { IUserRepositoryToken } from './ports/user.repository';
import { LoginUserUseCase } from '../auth/application/use-cases/login-user.use-case';
import { JwtTokenModule } from '../../shared/infrastructure/jwt/jwt.token.module';
import { RegisterEmailUseCase } from './application/use-cases/register-email.use-case';
import { CreateRandomUsersUserCase } from './application/use-cases/create-random-users.user-case';
import { ImageEntity } from '../../infra/db/entities/user/image.entity';
import { UploadGameResultImageUseCase } from './application/use-cases/upload-game-result-image.use-case';
import { IImageRepositoryToken } from './ports/image.repository';
import { TypeormImageRepository } from './adapters/typeorm-image.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ImageEntity]), JwtTokenModule],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    LoginUserUseCase,
    RegisterEmailUseCase,
    CreateRandomUsersUserCase,
    UploadGameResultImageUseCase,
    { provide: IUserRepositoryToken, useClass: TypeormUserRepository },
    { provide: IImageRepositoryToken, useClass: TypeormImageRepository },
  ],
  exports: [CreateRandomUsersUserCase, IUserRepositoryToken],
})
export class UsersModule {}
