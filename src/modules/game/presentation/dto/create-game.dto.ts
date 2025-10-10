import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Exclude, Type } from 'class-transformer';

export class GameOptionDto {
  @Exclude()
  id?: string;

  @ApiProperty({ description: '선택지 순서 (0 또는 1)', example: 0 })
  @IsInt()
  @Min(0)
  @Max(1)
  index!: number;

  @ApiProperty({ description: '선택지 텍스트', example: 'A를 선택한다' })
  @IsString()
  label!: string;
}

export class CreateGameDto {
  @Exclude()
  id?: string;

  @ApiProperty({ description: '질문 텍스트', example: '커피 vs 차' })
  @IsString()
  text!: string;

  @ApiProperty({ description: '라운드 번호', example: 1 })
  @IsInt()
  round!: number;

  @ApiProperty({
    description: '선택지 (항상 2개여야 함)',
    type: [GameOptionDto],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => GameOptionDto)
  options!: GameOptionDto[];
}
