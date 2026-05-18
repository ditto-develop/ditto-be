import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KakaoPlaceSearchResultDto } from '@module/chat/application/dto/vote.dto';

type KakaoKeywordDocument = {
  id?: unknown;
  place_name?: unknown;
  address_name?: unknown;
  road_address_name?: unknown;
  place_url?: unknown;
  x?: unknown;
  y?: unknown;
};

type KakaoKeywordResponse = {
  documents?: KakaoKeywordDocument[];
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toNumberValue(value: unknown): number | undefined {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number.parseFloat(value)
      : Number.NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

function createKakaoAgentHeader(origin: string): string {
  return `sdk/1.0.0 os/javascript lang/ko-KR device/web origin/${encodeURIComponent(origin)}`;
}

@Injectable()
export class KakaoLocalService {
  constructor(private readonly configService: ConfigService) {}

  async searchKeyword(query: string, size = 15): Promise<KakaoPlaceSearchResultDto[]> {
    const restApiKey = this.configService.get<string>('kakao.restApiKey');
    const localOrigin = this.configService.get<string>('kakao.localOrigin') || 'https://ditto.pics';
    if (!restApiKey) {
      throw new Error('KAKAO_REST_API_KEY가 설정되어 있지 않습니다.');
    }

    const params = new URLSearchParams({
      query,
      size: String(Math.min(Math.max(size, 1), 15)),
    });
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`, {
      headers: {
        Authorization: `KakaoAK ${restApiKey}`,
        KA: createKakaoAgentHeader(localOrigin),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`카카오 장소 검색에 실패했습니다. (${response.status}) ${errorBody}`);
    }

    const payload = (await response.json()) as KakaoKeywordResponse;
    const documents = Array.isArray(payload.documents) ? payload.documents : [];

    return documents.map((document) => {
      const address = toStringValue(document.road_address_name) || toStringValue(document.address_name);

      return {
        id: toStringValue(document.id),
        name: toStringValue(document.place_name),
        address,
        mapUrl: toStringValue(document.place_url),
        latitude: toNumberValue(document.y),
        longitude: toNumberValue(document.x),
      };
    });
  }
}
