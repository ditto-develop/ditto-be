import { ApiProperty } from '@nestjs/swagger';

export class CalculateResultRarityResponseDto {
  @ApiProperty({
    description: '희귀도(%)',
    example: 15,
    type: Number,
  })
  rarity: number;
}
