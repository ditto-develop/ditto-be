import { Exclude, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsString, Max, Min, ValidateNested } from 'class-validator';
import { ApiUidProperty } from '../../../../common/decorators/api-uid.decorator';
import { NanoId } from '../../../../common/value-objects/nanoid.vo';

export class GameOptionDto {
  @ApiUidProperty('게임 선택지 고유 ID')
  id: string;

  @ApiProperty({ description: '선택지 순서 (0 또는 1)' })
  @IsInt()
  @Min(0)
  @Max(1)
  index!: number;

  @ApiProperty({ description: '선택지 텍스트' })
  @IsString()
  label!: string;
}

export class GameDto {
  @ApiUidProperty('게임 고유 ID')
  id: string;

  @ApiProperty({ description: '질문 텍스트', example: '커피 vs 차' })
  @IsString()
  text!: string;

  @ApiProperty({ description: '라운드 번호', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  round!: number;

  @ApiProperty({
    description: '선택지 (항상 2개여야 함)',
    type: [GameOptionDto],
    example: [
      { id: NanoId.create().toString(), index: 0, label: '커피' },
      { id: NanoId.create().toString(), index: 1, label: '차' },
    ],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => GameOptionDto)
  options!: GameOptionDto[];

  @ApiProperty({ description: '게임 순서', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  index?: number;
}
