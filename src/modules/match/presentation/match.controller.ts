import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerApiResponse } from '../../../common/decorators/swagger-api-response.decorator';
import { CalculateResultRarityResponseDto } from './dto/calculate-result-rarity-response.dto';
import { SimilarUsersCountResponseDto } from './dto/similar-users-count-response.dto';

@ApiTags('Match')
@Controller('match')
export class MatchController {
  constructor() {}

  @Get('similar-user-count')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'x% 이상 일치한 사용자 수 조회 API' })
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'matchRate', required: false, type: Number, description: '매치율 (x%)' })
  @SwaggerApiResponse({ type: SimilarUsersCountResponseDto })
  @SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @SwaggerApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  getSimilarUsersCount(@Query('matchRate') matchRate?: string): SimilarUsersCountResponseDto {
    return {
      count: 4,
    };
  }

  @Get('result-rarity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '게임 결과 희귀도 계산 API' })
  @ApiBearerAuth('access-token')
  @SwaggerApiResponse({ type: CalculateResultRarityResponseDto })
  @SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @SwaggerApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  calculateResultRarity(): CalculateResultRarityResponseDto {
    return {
      rarity: 15,
    };
  }
}
