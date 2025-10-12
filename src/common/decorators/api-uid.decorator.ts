import { ApiProperty } from '@nestjs/swagger';
import { NanoId } from '../value-objects/nanoid.vo';

export const ApiUidProperty = (description: string) =>
  ApiProperty({
    description: description,
    example: NanoId.create().toString(),
    format: 'nanoid',
    type: String,
  });
