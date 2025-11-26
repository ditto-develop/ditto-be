import { Inject, Injectable } from '@nestjs/common';
import { Quiz } from 'src/modules/quiz/domain/entities/quiz.entity';
import {
  IQuizRepository,
  QUIZ_REPOSITORY_TOKEN,
} from 'src/modules/quiz/infrastructure/repository/quiz.repository.interface';
import { CreateQuizDto } from 'src/modules/quiz_/presentation/dto/create-quiz.dto';

@Injectable()
export class CreateQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
  ) {
    console.log('[CreateQuizUseCase] CreateQuizUseCase 초기화');
  }

  async execute(dto: CreateQuizDto): Promise<Quiz> {
    console.log(`[CreateQuizUseCase] Quiz 생성 시작: question=${dto.question}`);

    const quiz = Quiz.create('', dto.question, dto.order, dto.quizSetId);

    const created = await this.quizRepository.create(quiz);

    console.log(`[CreateQuizUseCase] Quiz 생성 완료: id=${created.id}`);
    return created;
  }
}
