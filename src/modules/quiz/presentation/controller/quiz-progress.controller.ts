import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { ApiCommonErrorResponses, ApiNotFoundResponse } from '@common/command/api-error-response.decorator';
import { ICommandResult } from '@common/command/command.interface';
import { JwtAuthGuard } from '@module/user/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@module/user/infrastructure/decorators/current-user.decorator';
import { User } from '@module/user/domain/entities/user.entity';
import { SubmitQuizAnswerDto } from '@module/quiz/application/dto/submit-quiz-answer.dto';
import { QuizProgressDto } from '@module/quiz/application/dto/quiz-progress.dto';
import { GetQuizSetWithProgressResponseDto } from '@module/quiz/application/dto/get-quiz-set-with-progress-response.dto';
import { SubmitQuizAnswerCommand } from '../commands/submit-quiz-answer.command';
import { GetQuizProgressCommand } from '../commands/get-quiz-progress.command';
import { ResetWeekProgressCommand } from '../commands/reset-week-progress.command';
import { GetQuizSetWithProgressCommand } from '../commands/get-quiz-set-with-progress.command';

@ApiTags('Quiz Progress')
@Controller('quiz-progress')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiCommonErrorResponses()
export class QuizProgressController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('answers')
  @ApiOperation({ summary: '퀴즈 답변 제출/수정' })
  @ApiCommandResponse(201, '답변 제출 성공')
  async submitAnswer(@CurrentUser() user: User, @Body() dto: SubmitQuizAnswerDto): Promise<ICommandResult<void>> {
    const command = new SubmitQuizAnswerCommand(user.id, dto);
    return await this.commandBus.execute<void>(command);
  }

  @Get('current')
  @ApiOperation({ summary: '현재 주차 퀴즈 진행 상태 조회' })
  @ApiCommandResponse(200, '진행 상태 조회 성공', QuizProgressDto)
  async getProgress(@CurrentUser() user: User): Promise<ICommandResult<QuizProgressDto>> {
    const command = new GetQuizProgressCommand(user.id);
    return await this.commandBus.execute<QuizProgressDto>(command);
  }

  @Post('reset')
  @ApiOperation({ summary: '현재 주차 퀴즈 진행 상태 초기화' })
  @ApiCommandResponse(200, '초기화 성공')
  async resetProgress(@CurrentUser() user: User): Promise<ICommandResult<void>> {
    const command = new ResetWeekProgressCommand(user.id);
    return await this.commandBus.execute<void>(command);
  }

  @Get('quiz-sets/:id')
  @ApiOperation({ summary: '퀴즈 세트 조회 (진행 상태 포함)' })
  @ApiCommandResponse(200, '퀴즈 세트 조회 성공', GetQuizSetWithProgressResponseDto)
  @ApiNotFoundResponse('퀴즈 세트를 찾을 수 없음')
  async getQuizSetWithProgress(
    @CurrentUser() user: User,
    @Param('id') quizSetId: string,
  ): Promise<ICommandResult<GetQuizSetWithProgressResponseDto>> {
    const command = new GetQuizSetWithProgressCommand(user.id, quizSetId);
    return await this.commandBus.execute<any>(command);
  }
}
