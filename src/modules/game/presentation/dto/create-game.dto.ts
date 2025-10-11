import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { GameDto, GameOptionDto } from './game.dto';

export class CreateGameOptionDto extends OmitType(GameOptionDto, ['id'] as const) {
  @Exclude()
  id?: string;
}

export class CreateGameDto extends OmitType(GameDto, ['id', 'options'] as const) {
  @Exclude()
  id?: string;

  @ApiProperty({
    description: '선택지 (항상 2개여야 함)',
    type: [CreateGameOptionDto],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateGameOptionDto)
  options!: CreateGameOptionDto[];
}
