import { ApiProperty } from '@nestjs/swagger';

export const ApiUidProperty = (description: string) =>
  ApiProperty({
    description: description,
    example: '0nI_7bpoV_dza6k4RyZwz',
    format: 'nanoid',
    type: String,
  });
