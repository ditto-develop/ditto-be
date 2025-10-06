import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../../../../infra/db/entities/user.entity';

export class CreateUserResponseDto extends PickType(UserEntity, ['id'] as const) {}
