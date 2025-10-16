import { Module } from '@nestjs/common';
import { ISeederToken } from './export interface Seeder';
import { GameSeeder } from '../../modules/game/application/seeders/game.seeder';
import { SeedRunner } from './seed.runner';
import { GameModule } from '../../modules/game/game.module';
import { UserSeeder } from '../../modules/user/application/seeders/user.seeder';
import { UsersModule } from '../../modules/user/users.module';

@Module({
  imports: [UsersModule, GameModule],
  providers: [
    UserSeeder,
    GameSeeder,
    {
      provide: ISeederToken,
      useFactory: (userSeeder: UserSeeder, gameSeeder: GameSeeder) => {
        return [userSeeder, gameSeeder];
      },
      inject: [UserSeeder, GameSeeder],
    },
    SeedRunner,
  ],
})
export class SeederModule {}
