import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommandBus } from 'src/common/command/command-bus';
import { ICommandResult } from 'src/common/command/command.interface';
import { CreateQuizDto } from 'src/modules/quiz/application/dto/create-quiz.dto';
import { QuizDto } from 'src/modules/quiz/application/dto/quiz.dto';
import { CreateQuizCommand } from 'src/modules/quiz/presentation/commands/create-quiz.command';

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
    type: QuizDto,
  })
  async create(@Body() dto: CreateQuizDto): Promise<ICommandResult<QuizDto>> {
    console.log(`[QuizController] Quiz 생성: question=${dto.question}`);
    const command = new CreateQuizCommand(dto);
    return await this.commandBus.execute<QuizDto>(command);
  }
}
