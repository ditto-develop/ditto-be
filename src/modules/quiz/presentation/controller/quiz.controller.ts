import { CommandBus } from '@common/command/command-bus';
import { ICommandResult } from '@common/command/command.interface';
import { CreateQuizDto } from '@module/quiz/application/dto/create-quiz.dto';
import { QuizDto } from '@module/quiz/application/dto/quiz.dto';
import { UpdateQuizDto } from '@module/quiz/application/dto/update-quiz.dto';
import { CreateQuizCommand } from '@module/quiz/presentation/commands/create-quiz.command';
import { DeleteQuizCommand } from '@module/quiz/presentation/commands/delete-quiz.command';
import { GetQuizCommand } from '@module/quiz/presentation/commands/get-quiz.command';
import { UpdateQuizCommand } from '@module/quiz/presentation/commands/update-quiz.command';
import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Quizzes')
@Controller('quizzes')
@UsePipes(new ValidationPipe())
export class QuizController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: '퀴즈 생성' })
  @ApiResponse({
    status: 201,
    description: '퀴즈 생성 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/QuizDto' },
        error: { type: 'string', example: '에러 메시지' },
      },
    },
  })
  async create(@Body() dto: CreateQuizDto): Promise<ICommandResult<QuizDto>> {
    console.log(`[QuizController] Quiz 생성: question=${dto.question}`);
    const command = new CreateQuizCommand(dto);
    return await this.commandBus.execute<QuizDto>(command);
  }

  @Get(':id')
  @ApiOperation({ summary: '퀴즈 조회' })
  @ApiResponse({
    status: 200,
    description: '퀴즈 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/QuizDto' },
        error: { type: 'string', example: '에러 메시지' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '퀴즈를 찾을 수 없음',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: '퀴즈를 찾을 수 없습니다.' },
      },
    },
  })
  async findById(@Param('id') id: string): Promise<ICommandResult<QuizDto>> {
    console.log(`[QuizController] Quiz 조회: id=${id}`);
    const command = new GetQuizCommand(id);
    return await this.commandBus.execute<QuizDto>(command);
  }

  @Put(':id')
  @ApiOperation({ summary: '퀴즈 수정' })
  @ApiResponse({
    status: 200,
    description: '퀴즈 수정 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/QuizDto' },
        error: { type: 'string', example: '에러 메시지' },
      },
    },
  })
  async update(@Param('id') id: string, @Body() dto: UpdateQuizDto): Promise<ICommandResult<QuizDto>> {
    console.log(`[QuizController] Quiz 수정: id=${id}`);
    const command = new UpdateQuizCommand(id, dto);
    return await this.commandBus.execute<QuizDto>(command);
  }

  @Delete(':id')
  @ApiOperation({ summary: '퀴즈 삭제' })
  @ApiResponse({
    status: 200,
    description: '퀴즈 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        error: { type: 'string', example: '에러 메시지' },
      },
    },
  })
  async delete(@Param('id') id: string): Promise<ICommandResult<void>> {
    console.log(`[QuizController] Quiz 삭제: id=${id}`);
    const command = new DeleteQuizCommand(id);
    return await this.commandBus.execute<void>(command);
  }
}
