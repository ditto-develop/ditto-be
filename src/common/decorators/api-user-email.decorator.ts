import { ApiProperty } from '@nestjs/swagger';

export const ApiUserEmailProperty = () =>
  ApiProperty({
    description: '이메일',
    example: 'user@example.com',
    format: 'email',
    type: String,
  });
