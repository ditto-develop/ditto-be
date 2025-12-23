import { CommandBus } from '@common/command/command-bus';
import { ICommandResult } from '@common/command/command.interface';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { CreateQuizDto } from '@module/quiz/application/dto/create-quiz.dto';
import { QuizDto } from '@module/quiz/application/dto/quiz.dto';
import { UpdateQuizDto } from '@module/quiz/application/dto/update-quiz.dto';
import { CreateQuizCommand } from '@module/quiz/presentation/commands/create-quiz.command';
import { DeleteQuizCommand } from '@module/quiz/presentation/commands/delete-quiz.command';
import { GetQuizCommand } from '@module/quiz/presentation/commands/get-quiz.command';
import { UpdateQuizCommand } from '@module/quiz/presentation/commands/update-quiz.command';
import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Quizzes')
@Controller('quizzes')
@UsePipes(new ValidationPipe())
export class QuizController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: '퀴즈 생성' })
  @ApiCommandResponse(201, '퀴즈 생성 성공', QuizDto)
  async create(@Body() dto: CreateQuizDto): Promise<ICommandResult<QuizDto>> {
    console.log(`[QuizController] Quiz 생성: question=${dto.question}`);
    const command = new CreateQuizCommand(dto);
    return await this.commandBus.execute<QuizDto>(command);
  }

  @Get(':id')
  @ApiOperation({ summary: '퀴즈 조회' })
  @ApiCommandResponse(200, '퀴즈 조회 성공', QuizDto)
  @ApiCommandResponse(404, '퀴즈를 찾을 수 없음')
  async findById(@Param('id') id: string): Promise<ICommandResult<QuizDto>> {
    console.log(`[QuizController] Quiz 조회: id=${id}`);
    const command = new GetQuizCommand(id);
    return await this.commandBus.execute<QuizDto>(command);
  }

  @Put(':id')
  @ApiOperation({ summary: '퀴즈 수정' })
  @ApiCommandResponse(200, '퀴즈 수정 성공', QuizDto)
  async update(@Param('id') id: string, @Body() dto: UpdateQuizDto): Promise<ICommandResult<QuizDto>> {
    console.log(`[QuizController] Quiz 수정: id=${id}`);
    const command = new UpdateQuizCommand(id, dto);
    return await this.commandBus.execute<QuizDto>(command);
  }

  @Delete(':id')
  @ApiOperation({ summary: '퀴즈 삭제' })
  @ApiCommandResponse(200, '퀴즈 삭제 성공')
  async delete(@Param('id') id: string): Promise<ICommandResult<void>> {
    console.log(`[QuizController] Quiz 삭제: id=${id}`);
    const command = new DeleteQuizCommand(id);
    return await this.commandBus.execute<void>(command);
  }
}
