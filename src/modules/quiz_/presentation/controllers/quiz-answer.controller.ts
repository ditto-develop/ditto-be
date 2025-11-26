import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SubmitQuizAnswerDto } from '../dto/submit-quiz-answer.dto';
import { QuizAnswerResponseDto } from '../dto/quiz-answer-response.dto';
import { SubmitQuizAnswerUseCase } from '../../application/usecases/submit-quiz-answer.usecase';
import { SubmitQuizAnswerCommand } from '../../application/commands/submit-quiz-answer.command';

@ApiTags('Quiz Answers')
@Controller('quiz-answers')
@UsePipes(new ValidationPipe())
export class QuizAnswerController {
  constructor(
    private readonly submitQuizAnswerUseCase: SubmitQuizAnswerUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Submit a quiz answer' })
  @ApiResponse({ status: 201, description: 'Quiz answer submitted successfully', type: QuizAnswerResponseDto })
  async submit(@Body() submitQuizAnswerDto: SubmitQuizAnswerDto): Promise<QuizAnswerResponseDto> {
    const command = new SubmitQuizAnswerCommand(
      submitQuizAnswerDto.id,
      submitQuizAnswerDto.userId,
      submitQuizAnswerDto.quizId,
      submitQuizAnswerDto.choiceId,
    );

    const quizAnswer = await this.submitQuizAnswerUseCase.execute(command);
    return QuizAnswerResponseDto.fromEntity(quizAnswer);
  }
}


