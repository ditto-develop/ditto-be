import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponse<T = unknown> {
  @ApiPropertyOptional({ description: '요청 성공 여부' })
  success: boolean;

  @ApiPropertyOptional({ description: '응답 메시지', example: '요청에 성공했습니다.' })
  message: string;

  @ApiPropertyOptional({ description: '에러 코드', required: false })
  errorCode?: string;

  @ApiPropertyOptional()
  @Type(() => Object)
  data?: T | null;

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
  }
}
