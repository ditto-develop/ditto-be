import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { QuizSetDto } from '@module/quiz/application/dto/quiz-set.dto';
import { ICommandResult } from '@common/command/command.interface';
import { CreateQuizSetDto } from '@module/quiz/application/dto/create-quiz-set.dto';
import { CreateQuizSetCommand } from '@module/quiz/presentation/commands/create-quiz-set.command';
import { QuizSetListQueryDto } from '@module/quiz/application/dto/quiz-set-list-query.dto';
import { GetQuizSetsCommand } from '@module/quiz/presentation/commands/get-quiz-sets.command';
import { GetQuizSetCommand } from '@module/quiz/presentation/commands/get-quiz-set.command';
import { UpdateQuizSetDto } from '@module/quiz/application/dto/update-quiz-set.dto';
import { UpdateQuizSetCommand } from '@module/quiz/presentation/commands/update-quiz-set.command';
import { DeleteQuizSetCommand } from '@module/quiz/presentation/commands/delete-quiz-set.command';
import { ActivateQuizSetCommand } from '@module/quiz/presentation/commands/activate-quiz-set.command';
import { DeactivateQuizSetCommand } from '@module/quiz/presentation/commands/deactivate-quiz-set.command';

@ApiTags('Quiz Sets')
@Controller('quiz-sets')
export class QuizSetController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: '퀴즈 세트 생성' })
  @ApiCommandResponse(201, '퀴즈 세트 생성 성공', QuizSetDto)
  async create(@Body() dto: CreateQuizSetDto): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[QuizSetController] QuizSet 생성: title=${dto.title}`);
    const command = new CreateQuizSetCommand(dto);
    return await this.commandBus.execute<QuizSetDto>(command);
  }

  @Get()
  @ApiOperation({ summary: '퀴즈 세트 목록 조회' })
  @ApiCommandResponse(200, '퀴즈 세트 목록 조회 성공', QuizSetDto, true)
  async findAll(@Query() query: QuizSetListQueryDto): Promise<ICommandResult<QuizSetDto[]>> {
    console.log(`[QuizSetController] QuizSet 목록 조회: query=${JSON.stringify(query)}`);
    const command = new GetQuizSetsCommand(query);
    return await this.commandBus.execute<QuizSetDto[]>(command);
  }

  @Get(':id')
  @ApiOperation({ summary: '퀴즈 세트 조회' })
  @ApiResponse({
    status: 200,
    description: '퀴즈 세트 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/QuizSetDto' },
        error: { type: 'string', example: '에러 메시지' },
      },
    },
  })
  async findById(@Param('id') id: string): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[QuizSetController] QuizSet 조회: id=${id}`);
    const command = new GetQuizSetCommand(id);
    return await this.commandBus.execute<QuizSetDto>(command);
  }

  @Put(':id')
  @ApiOperation({ summary: '퀴즈 세트 수정' })
  @ApiCommandResponse(200, '퀴즈 세트 수정 성공', QuizSetDto)
  async update(@Param('id') id: string, @Body() dto: UpdateQuizSetDto): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[QuizSetController] QuizSet 수정: id=${id}`);
    const command = new UpdateQuizSetCommand(id, dto);
    return await this.commandBus.execute<QuizSetDto>(command);
  }

  @Delete(':id')
  @ApiOperation({ summary: '퀴즈 세트 삭제' })
  @ApiCommandResponse(200, '퀴즈 세트 삭제 성공')
  async delete(@Param('id') id: string): Promise<ICommandResult<void>> {
    console.log(`[QuizSetController] QuizSet 삭제: id=${id}`);
    const command = new DeleteQuizSetCommand(id);
    return await this.commandBus.execute<void>(command);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: '퀴즈 세트 활성화' })
  @ApiCommandResponse(200, '퀴즈 세트 활성화 성공', QuizSetDto)
  async activate(@Param('id') id: string): Promise<ICommandResult<QuizSetDto>> {
    console.log(`[QuizSetController] QuizSet 활성화: id=${id}`);
    const command = new ActivateQuizSetCommand(id);
    return await this.commandBus.execute<QuizSetDto>(command);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: '퀴즈 세트 비활성화' })
  @ApiCommandResponse(200, '퀴즈 세트 비활성화 성공')
  async deactivate(@Param('id') id: string): Promise<ICommandResult<void>> {
    console.log(`[QuizSetController] QuizSet 비활성화: id=${id}`);
    const command = new DeactivateQuizSetCommand(id);
    return await this.commandBus.execute<void>(command);
  }
}
