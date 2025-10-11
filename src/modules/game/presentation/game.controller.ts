import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AnswerItem } from './dto/submit-answers.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { type UserPayload } from '../../../common/typeguards/auth.type-guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SwaggerApiResponse } from '../../../common/decorators/swagger-api-response.decorator';
import { CreateGameUseCase } from '../application/use-cases/create-game.use-case';
import { CreateGameDto } from './dto/create-game.dto';
import { CreateGameCommand } from '../application/commands/create-game.command';
import { LoadAllGamesCommand } from '../application/commands/load-all-games.command';
import { LoadAllGamesUseCase } from '../application/use-cases/load-all-games.use-case';
import { GameDto } from './dto/game.dto';

@ApiTags('Game')
@Controller('game')
export class GameController {
  constructor(
    private readonly createGameUseCase: CreateGameUseCase,
    private readonly loadAllGamesUseCase: LoadAllGamesUseCase,
  ) {}

  @Post()
  @ApiExcludeEndpoint()
  async create(@Body() dto: CreateGameDto): Promise<GameDto> {
    const cmd = new CreateGameCommand(dto);
    const saved = await this.createGameUseCase.execute(cmd);
    return saved.toPlain();
  }

  @Get(':round/questions')
  @ApiOperation({ summary: '라운드 질문 조회' })
  @SwaggerApiResponse({ type: GameDto, isArray: true })
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, errorMessage: '반환 가능한 질문이 없음. (데이터가 없을 때)' })
  @SwaggerApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  async getQuestions(@Param('round', ParseIntPipe) round: number): Promise<GameDto[]> {
    const cmd = new LoadAllGamesCommand(round);
    const loaded = await this.loadAllGamesUseCase.execute(cmd);
    return loaded.map((g) => g.toPlain());
  }

  @Get(':round/questions/:questionId')
  @ApiOperation({ summary: '라운드 질문 단일 조회 (임시 - 사용할지 안할지 모르겠음)' })
  @SwaggerApiResponse({ status: 200 })
  getQuestion(@Param('round') round: string, @Param('questionId') questionId: string) {
    // TODO:: 실제: gameService.getQuestionsForRound(round)
    return {
      id: questionId,
      text: '질문1',
      options: [
        { index: 0, label: 'A' },
        { index: 1, label: 'B' },
      ],
      round: Number(round),
    };
  }

  @Post(':round/questions/:questionId/answer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '단일 질문 답안 제출' })
  @ApiBearerAuth()
  @SwaggerApiResponse()
  @SwaggerApiResponse({ status: HttpStatus.NOT_FOUND, errorMessage: '존재하지 않은 질문' })
  @SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @SwaggerApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  submitAnswers(
    @Param('round') round: string,
    @Param('questionId') questionId: string,
    @Body() dto: AnswerItem,
    @CurrentUser() user: UserPayload,
  ) {
    // TODO:: 실제: gameService.saveAnswers(userId, round, dto.answers)
    return;
  }
}
