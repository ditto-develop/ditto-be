import { Controller, Get, HttpStatus, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerApiResponse } from '../../../common/decorators/swagger-api-response.decorator';
import { CalculateResultRarityResponseDto } from './dto/calculate-result-rarity-response.dto';
import { SimilarUsersCountResponseDto } from './dto/similar-users-count-response.dto';
import { CountSimilarUseCase } from '../application/use-cases/count-similar.use-case';
import { CountSimilarCommand } from '../application/commands/count-similar.command';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../../common/typeguards/auth.type-guard';
import { GetGameResultKeyUseCase } from '../../game/application/use-cases/get-game-result-key.use-case';
import { GetGameResultKeyCommand } from '../../game/application/commands/get-game-result-key.command';

@ApiTags('Match')
@Controller('match')
export class MatchController {
  constructor(
    private readonly countSimilarUseCase: CountSimilarUseCase,
    private readonly getGameResultKeyUseCase: GetGameResultKeyUseCase,
  ) {}

  @Get(':round/similar-user-count')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'x% 이상 일치한 사용자 수 조회 API' })
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'matchRate', required: false, type: Number, description: '매치율 (x%) - 기본 값(80)' })
  @SwaggerApiResponse({ type: SimilarUsersCountResponseDto })
  @SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @SwaggerApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  async getSimilarUsersCount(
    @Param('round', ParseIntPipe) round: number,
    @CurrentUser() user: UserPayload,
    @Query('matchRate', ParseIntPipe) matchRate?: number,
  ): Promise<SimilarUsersCountResponseDto> {
    if (!matchRate) matchRate = 80;
    const getGameResultKeyCmd = new GetGameResultKeyCommand({
      userId: user.id,
      round,
    });
    const gameResult = await this.getGameResultKeyUseCase.execute(getGameResultKeyCmd);
    const countSimilarCmd = new CountSimilarCommand(gameResult, matchRate, round);

    const result = await this.countSimilarUseCase.execute(countSimilarCmd);
    return {
      total: result.total,
      count: result.similarCount,
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
