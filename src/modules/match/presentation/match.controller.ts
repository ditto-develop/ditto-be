import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerApiResponse } from '../../../common/decorators/swagger-api-response.decorator';
import { CalculateResultRarityResponseDto } from './dto/calculate-result-rarity-response.dto';
import { SimilarUsersCountResponseDto } from './dto/similar-users-count-response.dto';

@ApiTags('Match')
@Controller('match')
@ApiExtraModels(SimilarUsersCountResponseDto, CalculateResultRarityResponseDto)
export class MatchController {
  constructor() {}

  @Get('similar-user-count')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'x% 이상 일치한 사용자 수 조회 API' })
  @ApiBearerAuth('access-token')
  @SwaggerApiResponse({ type: SimilarUsersCountResponseDto })
  getSimilarUsersCount(): SimilarUsersCountResponseDto {
    return {
      count: 4,
    };
  }

  @Get('result-rarity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '게임 결과 희귀도 계산 API' })
  @ApiBearerAuth('access-token')
  @SwaggerApiResponse({ type: CalculateResultRarityResponseDto })
  calculateResultRarity(): CalculateResultRarityResponseDto {
    return {
      rarity: 15,
    };
  }
}
