import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { ApiCommonErrorResponses, ApiNotFoundResponse, ApiNoContentResponse } from '@common/command/api-error-response.decorator';
import { QuizSetDto } from '@module/quiz/application/dto/quiz-set.dto';
import { ICommandResult } from '@common/command/command.interface';
import { CreateQuizSetDto } from '@module/quiz/application/dto/create-quiz-set.dto';
import { CreateQuizSetCommand } from '@module/quiz/presentation/commands/create-quiz-set.command';
import { QuizSetListQueryDto } from '@module/quiz/application/dto/quiz-set-list-query.dto';
import { GetQuizSetsCommand } from '@module/quiz/presentation/commands/get-quiz-sets.command';
import { GetQuizSetCommand } from '@module/quiz/presentation/commands/get-quiz-set.command';
import { GetCurrentWeekQuizSetsCommand } from '@module/quiz/presentation/commands/get-current-week-quiz-sets.command';
import { CurrentWeekQuizSetsResponseDto } from '@module/quiz/application/dto/current-week-quiz-sets-response.dto';
import { UpdateQuizSetDto } from '@module/quiz/application/dto/update-quiz-set.dto';
import { UpdateQuizSetCommand } from '@module/quiz/presentation/commands/update-quiz-set.command';
import { DeleteQuizSetCommand } from '@module/quiz/presentation/commands/delete-quiz-set.command';
import { ActivateQuizSetCommand } from '@module/quiz/presentation/commands/activate-quiz-set.command';
import { DeactivateQuizSetCommand } from '@module/quiz/presentation/commands/deactivate-quiz-set.command';
import { QuizSetGroupedResponseDto } from '@module/quiz/application/dto/quiz-set-grouped-response.dto';
import { ReorderQuizzesDto } from '@module/quiz/application/dto/reorder-quizzes.dto';
import { ReorderQuizzesCommand } from '@module/quiz/presentation/commands/reorder-quizzes.command';
import { JwtAuthGuard } from '@module/user/infrastructure/guards/jwt-auth.guard';

@ApiTags('Quiz Sets')
@Controller('quiz-sets')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiCommonErrorResponses()
export class QuizSetController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: '퀴즈 세트 생성' })
  @ApiCommandResponse(201, '퀴즈 세트 생성 성공', QuizSetDto)
  async create(@Body() dto: CreateQuizSetDto): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[QuizSetController] QuizSet 생성: title=${dto.title}`);
    const command = new CreateQuizSetCommand(dto, dto.forcePassword);
    return await this.commandBus.execute<QuizSetDto>(command);
  }

  @Get()
  @ApiOperation({ summary: '퀴즈 세트 목록 조회' })
  @ApiCommandResponse(200, '퀴즈 세트 목록 조회 성공', QuizSetGroupedResponseDto)
  async findAll(@Query() query: QuizSetListQueryDto): Promise<ICommandResult<QuizSetGroupedResponseDto>> {
    console.log(`[QuizSetController] QuizSet 목록 조회: query=${JSON.stringify(query)}`);
    const command = new GetQuizSetsCommand(query);
    return await this.commandBus.execute<QuizSetGroupedResponseDto>(command);
  }

  @Get('current-week')
  @ApiOperation({ summary: '이번 주차 퀴즈 세트 조회' })
  @ApiCommandResponse(200, '이번 주차 퀴즈 세트 조회 성공', CurrentWeekQuizSetsResponseDto)
  async getCurrentWeek(): Promise<ICommandResult<CurrentWeekQuizSetsResponseDto>> {
    console.log('[QuizSetController] 이번 주차 퀴즈 세트 조회');
    const command = new GetCurrentWeekQuizSetsCommand();
    return await this.commandBus.execute<CurrentWeekQuizSetsResponseDto>(command);
  }

  @Get(':id')
  @ApiOperation({ summary: '퀴즈 세트 조회' })
  @ApiCommandResponse(200, '퀴즈 세트 조회 성공', QuizSetDto)
  @ApiNotFoundResponse('퀴즈 세트를 찾을 수 없음')
  async findById(@Param('id') id: string): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[QuizSetController] QuizSet 조회: id=${id}`);
    const command = new GetQuizSetCommand(id);
    return await this.commandBus.execute<QuizSetDto>(command);
  }

  @Put(':id')
  @ApiOperation({ summary: '퀴즈 세트 수정' })
  @ApiCommandResponse(200, '퀴즈 세트 수정 성공', QuizSetDto)
  @ApiNotFoundResponse('퀴즈 세트를 찾을 수 없음')
  async update(@Param('id') id: string, @Body() dto: UpdateQuizSetDto): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[QuizSetController] QuizSet 수정: id=${id}`);
    const command = new UpdateQuizSetCommand(id, dto, dto.forcePassword);
    return await this.commandBus.execute<QuizSetDto>(command);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: '퀴즈 세트 삭제' })
  @ApiNoContentResponse('퀴즈 세트 삭제 성공')
  async delete(@Param('id') id: string, @Query('forcePassword') forcePassword?: string): Promise<ICommandResult<void>> {
    console.log(`[QuizSetController] QuizSet 삭제: id=${id}`);
    const command = new DeleteQuizSetCommand(id, forcePassword);
    return await this.commandBus.execute<void>(command);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: '퀴즈 세트 활성화' })
  @ApiCommandResponse(200, '퀴즈 세트 활성화 성공', QuizSetDto)
  @ApiNotFoundResponse('퀴즈 세트를 찾을 수 없음')
  async activate(@Param('id') id: string): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[QuizSetController] QuizSet 활성화: id=${id}`);
    const command = new ActivateQuizSetCommand(id);
    return await this.commandBus.execute<QuizSetDto>(command);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: '퀴즈 세트 비활성화' })
  @ApiCommandResponse(200, '퀴즈 세트 비활성화 성공')
  @ApiNotFoundResponse('퀴즈 세트를 찾을 수 없음')
  async deactivate(@Param('id') id: string): Promise<ICommandResult<void>> {
    console.log(`[QuizSetController] QuizSet 비활성화: id=${id}`);
    const command = new DeactivateQuizSetCommand(id);
    return await this.commandBus.execute<void>(command);
  }

  @Patch(':id/reorder')
  @ApiOperation({ summary: '퀴즈 순서 일괄 변경 및 관리' })
  @ApiCommandResponse(200, '퀴즈 순서 변경 성공', QuizSetDto)
  @ApiNotFoundResponse('퀴즈 세트를 찾을 수 없음')
  async reorder(@Param('id') id: string, @Body() dto: ReorderQuizzesDto): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[QuizSetController] 퀴즈 순서 재정렬: id=${id}`);
    const command = new ReorderQuizzesCommand(id, dto);
    return await this.commandBus.execute<QuizSetDto>(command);
  }
}
