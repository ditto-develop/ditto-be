import { Inject, Injectable } from '@nestjs/common';
import { KakaoPlaceSearchResultDto } from '@module/chat/application/dto/vote.dto';
import { KakaoLocalService } from '@module/chat/infrastructure/external/kakao-local.service';
import { BusinessRuleException } from '@common/exceptions/domain.exception';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class SearchPlacesUseCase {
  constructor(
    private readonly kakaoLocalService: KakaoLocalService,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  async execute(currentUserId: string, query: string, size = 15): Promise<KakaoPlaceSearchResultDto[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      throw new BusinessRuleException('검색어를 입력해 주세요.');
    }

    this.logger.log('카카오 장소 검색', 'SearchPlacesUseCase', {
      currentUserId,
      query: normalizedQuery,
      size,
    });

    return this.kakaoLocalService.searchKeyword(normalizedQuery, size);
  }
}
