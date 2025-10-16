import { Module } from '@nestjs/common';
import { ISeederToken } from './export interface Seeder';
import { GameSeeder } from '../../modules/game/application/seeders/game.seeder';
import { SeedRunner } from './seed.runner';
import { GameModule } from '../../modules/game/game.module';
import { UserSeeder } from '../../modules/user/application/seeders/user.seeder';
import { UsersModule } from '../../modules/user/users.module';
import { GameAnswerSeeder } from '../../modules/game/application/seeders/game-answer.seeder';

@Module({
  imports: [UsersModule, GameModule],
  providers: [
    UserSeeder,
    GameSeeder,
    GameAnswerSeeder,
    {
      provide: ISeederToken,
      useFactory: (userSeeder: UserSeeder, gameSeeder: GameSeeder, gameAnswerSeeder: GameAnswerSeeder) => {
        return [userSeeder, gameSeeder, gameAnswerSeeder];
      },
      inject: [UserSeeder, GameSeeder, GameAnswerSeeder],
    },
    SeedRunner,
  ],
})
export class SeederModule {}
