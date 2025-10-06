import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QuestionDto } from './dto/question.dto';
import { AnswerItem } from './dto/submit-answers.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { type UserPayload } from '../../common/typeguards/auth.type-guard';

@ApiTags('Game')
@Controller('game')
export class GameController {
  @Get(':round/questions')
  @ApiOperation({ summary: '라운드 질문 조회' })
  @ApiResponse({ status: 200, type: QuestionDto, isArray: true })
  getQuestions(@Param('round') round: string) {
    // TODO:: 실제: gameService.getQuestionsForRound(round)
    const questions: QuestionDto[] = [
      {
        id: 'q1',
        text: '질문1',
        options: [
          { index: 0, label: 'A' },
          { index: 1, label: 'B' },
        ],
        round: Number(round),
      },
    ];
    return questions;
  }

  @Get(':round/questions/:questionId')
  @ApiOperation({ summary: '라운드 질문 단일 조회 (임시 - 사용할지 안할지 모르겠음)' })
  @ApiResponse({ status: 200 })
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
  // UserGuard(JwtAuthGuard)
  @ApiOperation({ summary: '단일 질문 답안 제출' })
  @ApiBearerAuth()
  submitAnswers(
    @Param('round') round: string,
    @Param('questionId') questionId: string,
    @Body() dto: AnswerItem,
    @CurrentUser() user: UserPayload,
  ) {
    // TODO:: 실제: gameService.saveAnswers(userId, round, dto.answers)
    return { ok: true };
  }
}
