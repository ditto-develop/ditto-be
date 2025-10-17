import { Inject, Injectable, Logger } from '@nestjs/common';
import { ISeeder } from '../../../../common/seeder/seeder.interface';
import { GameSeeder } from '../../../game/application/seeders/game.seeder';
import { type IUserRepository, IUserRepositoryToken } from '../../ports/user.repository';
import { CreateRandomUsersUserCase } from '../use-cases/create-random-users.user-case';

@Injectable()
export class UserSeeder implements ISeeder {
  private readonly logger = new Logger(GameSeeder.name);

  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepo: IUserRepository,
    private readonly createRandomUsersUseCase: CreateRandomUsersUserCase,
  ) {}

  async seed(): Promise<void> {
    const existingUsersCount = await this.userRepo.count();
    if (existingUsersCount === 0) {
      this.logger.log('사용자 데이터가 없으므로 더미 데이터를 추가합니다.');
      await this.createRandomUsersUseCase.execute(1000);
      this.logger.log('더미 데이터 추가 완료');
    } else {
      this.logger.log('사용자 데이터가 이미 존재합니다. 시딩 생략');
    }
  }
}
