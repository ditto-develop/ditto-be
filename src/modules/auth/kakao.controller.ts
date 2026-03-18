import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { KakaoService, KakaoUserInfo } from './kakao.service';

export class KakaoCallbackDto {
  @ApiProperty({ description: '카카오 인가 코드' })
  @IsString()
  code: string;

  @ApiProperty({ description: '리다이렉트 URI' })
  @IsString()
  redirectUri: string;
}

@ApiTags('Auth')
@Controller('auth')
export class KakaoController {
  constructor(private readonly kakaoService: KakaoService) {}

  @Post('kakao/callback')
  @HttpCode(200)
  @ApiOperation({ summary: '카카오 OAuth 콜백 - 인가 코드로 사용자 정보 조회' })
  async kakaoCallback(@Body() dto: KakaoCallbackDto): Promise<KakaoUserInfo> {
    return this.kakaoService.getKakaoUserInfo(dto.code, dto.redirectUri);
  }
}
