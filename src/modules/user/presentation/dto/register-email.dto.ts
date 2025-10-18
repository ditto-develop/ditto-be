import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../../../../infra/db/entities/user/user.entity';
import { ApiUserEmailProperty } from '../../../../common/decorators/api-user-email.decorator';
import { IsEmail } from 'class-validator';

export class RegisterEmailRequestDto {
  @ApiUserEmailProperty()
  @IsEmail()
  email: string;
}

export class RegisterEmailResponseDto extends PickType(UserEntity, ['id', 'email'] as const) {}
