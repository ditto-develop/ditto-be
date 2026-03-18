import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface KakaoUserInfo {
  kakaoId: string;
  nickname?: string;
  profileImage?: string;
  email?: string;
  gender?: string;
}

@Injectable()
export class KakaoService {
  constructor(private readonly configService: ConfigService) {}

  async getKakaoUserInfo(code: string, redirectUri: string): Promise<KakaoUserInfo> {
    const restApiKey = this.configService.get<string>('kakao.restApiKey');

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: restApiKey,
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new BadRequestException(`카카오 토큰 발급 실패: ${JSON.stringify(tokenData)}`);
    }

    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    const userData = await userResponse.json();

    return {
      kakaoId: String(userData.id),
      nickname: userData.properties?.nickname,
      profileImage: userData.properties?.profile_image,
      email: userData.kakao_account?.email,
      gender: userData.kakao_account?.gender,
    };
  }
}
