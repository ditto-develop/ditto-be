import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { QuizResponseDto } from '../dto/quiz-response.dto';
import { CreateQuizUseCase } from '../../application/usecases/create-quiz.usecase';
import { SwapQuizOrderUseCase } from '../../application/usecases/swap-quiz-order.usecase';
import { CreateQuizCommand } from '../../application/commands/create-quiz.command';
import { SwapQuizOrderCommand } from '../../application/commands/swap-quiz-order.command';

@ApiTags('Quizzes')
@Controller('quizzes')
@UsePipes(new ValidationPipe())
export class QuizController {
  constructor(
    private readonly createQuizUseCase: CreateQuizUseCase,
    private readonly swapQuizOrderUseCase: SwapQuizOrderUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully', type: QuizResponseDto })
  async create(@Body() createQuizDto: CreateQuizDto): Promise<QuizResponseDto> {
    const command = new CreateQuizCommand(
      createQuizDto.id,
      createQuizDto.question,
      createQuizDto.quizSetId,
      createQuizDto.order,
    );

    const quiz = await this.createQuizUseCase.execute(command);
    return QuizResponseDto.fromEntity(quiz);
  }

  @Post('swap-order')
  @ApiOperation({ summary: 'Swap order of two quizzes' })
  @ApiResponse({ status: 200, description: 'Quiz order swapped successfully' })
  async swapOrder(@Body() body: { quizId1: string; quizId2: string }): Promise<void> {
    const command = new SwapQuizOrderCommand(body.quizId1, body.quizId2);
    await this.swapQuizOrderUseCase.execute(command);
  }
}


