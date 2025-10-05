import { ApiProperty } from '@nestjs/swagger';

export class OptionDto {
  @ApiProperty()
  index: number;

  @ApiProperty()
  label: string;
}

export class QuestionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ type: [OptionDto] })
  options: OptionDto[];

  @ApiProperty()
  round: number;
}
