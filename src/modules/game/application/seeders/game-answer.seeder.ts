import { Inject, Injectable, Logger } from '@nestjs/common';
import { ISeeder } from '../../../../common/seeder/export interface Seeder';
import { GameSeeder } from './game.seeder';
import { type IGameRepository, IGameRepositoryToken } from '../../ports/game.repository';
import { type IGameAnswerRepository, IGameAnswerRepositoryToken } from '../../ports/game-answer.repository';
import { type IUserRepository, IUserRepositoryToken } from '../../../user/ports/user.repository';
import { SubmitAnswerDto } from '../../presentation/dto/submit-answers.dto';
import { SubmitGameAnswerCommand } from '../commands/submit-game-answer.command';

@Injectable()
export class GameAnswerSeeder implements ISeeder {
  order = 10;

  private readonly logger = new Logger(GameSeeder.name);

  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepo: IUserRepository,

    @Inject(IGameRepositoryToken)
    private readonly gameRepo: IGameRepository,

    @Inject(IGameAnswerRepositoryToken)
    private readonly gameAnswerRepo: IGameAnswerRepository,
  ) {}

  async seed(): Promise<void> {
    const existingGameAnswersCount = await this.gameAnswerRepo.count();
    if (existingGameAnswersCount === 0) {
      this.logger.log('게임 선택 데이터가 없으므로 더미 데이터를 추가합니다.');

      const games = await this.gameRepo.findAll(1);
      const users = await this.userRepo.findAll();

      const submitAnswerDtos: SubmitAnswerDto[] = [];

      users.forEach((user) => {
        const userId = user.id.toString();
        const dummyData = games.map((game) => ({
          userId,
          gameId: game.id.toString(),
          selectedIndex: Math.random() < 0.5 ? 0 : 1,
        }));

        submitAnswerDtos.push(...dummyData);
      });

      const submitGameAnswerCommands = submitAnswerDtos.map((dto) => new SubmitGameAnswerCommand(dto));
      const submitGameAnswers = submitGameAnswerCommands.map((cmd) => cmd.toDomain());

      await this.gameAnswerRepo.bulkSave(submitGameAnswers);
      this.logger.log('더미 데이터 추가 완료');
    } else {
      this.logger.log('게임 선택 데이터가 이미 존재합니다. 시딩 생략');
    }
  }
}
