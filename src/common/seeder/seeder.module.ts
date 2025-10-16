import { Module } from '@nestjs/common';
import { ISeederToken } from './export interface Seeder';
import { GameSeeder } from '../../modules/game/application/seeders/game.seeder';
import { SeedRunner } from './seed.runner';
import { GameModule } from '../../modules/game/game.module';

@Module({
  imports: [GameModule],
  providers: [{ provide: ISeederToken, useClass: GameSeeder }, SeedRunner],
})
export class SeederModule {}
