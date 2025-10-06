import { CreateUserResponseDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class StartResponseDto {
  @ApiProperty({
    description: '사용자 정보',
    type: CreateUserResponseDto,
  })
  user: CreateUserResponseDto;

  @ApiProperty({
    description: 'jwt',
    example: 'xxxxxxxxxxxxx',
    type: 'string',
  })
  jwt: string;

  @ApiProperty({
    description: '추천인 링크',
    example: 'https://example.com/r/xxxxxxxxxxxxx',
    type: 'string',
  })
  referralLink: string;
}
