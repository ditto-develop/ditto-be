import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsUUID } from 'class-validator';

class UserDto {
  @ApiProperty({
    description: '유저 고유 ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
    type: 'string',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
    format: 'email',
    type: 'string',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiProperty({
    description: '추천인 토큰',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    format: 'uuid',
    type: 'string',
  })
  @IsUUID()
  referral_token: string;
}

export class StartResponseDto {
  @ApiProperty({
    description: '사용자 정보',
    type: UserDto,
  })
  user: UserDto;

  @ApiProperty({
    description: 'jwt token',
  })
  jwt: string;

  @ApiProperty({
    description: '추천 링크',
  })
  referral_link: string;
}
