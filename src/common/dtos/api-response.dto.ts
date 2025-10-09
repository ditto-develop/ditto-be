import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponse<T = unknown> {
  @ApiPropertyOptional({ description: '요청 성공 여부' })
  success: boolean;

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
  }
}

export class SuccessApiResponse<T = unknown> extends ApiResponse<T> {
  @ApiPropertyOptional({ example: true })
  success: boolean = true;

  @ApiPropertyOptional({ nullable: true })
  data?: T | null;

  constructor(partial: Partial<SuccessApiResponse<T>>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class FailApiResponse<T = unknown> extends ApiResponse<T> {
  @ApiPropertyOptional({ example: false })
  success: boolean = false;

  @ApiPropertyOptional({ description: '에러 메시지', example: '요청에 실패했습니다.' })
  errMessage: string = '요청에 실패했습니다.';

  @ApiPropertyOptional({ description: '에러 코드', required: false })
  errorCode?: string;

  constructor(partial: Partial<FailApiResponse<T>>) {
    super(partial);
    Object.assign(this, partial);
  }
}
