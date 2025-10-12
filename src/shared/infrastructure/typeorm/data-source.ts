import { DataSourceOptions } from 'typeorm';
import { UserEntity } from '../../../infra/db/entities/user.entity';
import { GameEntity } from '../../../infra/db/entities/game/game.entity';
import { GameAnswerEntity } from '../../../infra/db/entities/game/game-answer.entity';
import { GameAnswerOptionEntity } from '../../../infra/db/entities/game/game-answer-option.entity';

export const getDataSourceOptions = (client: string) => {
  const isSqlite = client === 'sqlite';

  const commonEntities = [UserEntity, GameEntity, GameAnswerOptionEntity, GameAnswerEntity];

  let options: DataSourceOptions;
  if (isSqlite) {
    options = {
      type: 'sqlite',
      database: process.env.DB_PATH ?? './dev.sqlite',
      entities: commonEntities,
      synchronize: true, // 개발용: 편리하지만 프로덕션에서는 false
      logging: process.env.NODE_ENV !== 'production',
    } as DataSourceOptions;
  } else {
    options = {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: commonEntities,
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
      extra: { max: Number(process.env.DB_POOL_MAX || 10) },
    } as DataSourceOptions;
  }

  return options;
};
