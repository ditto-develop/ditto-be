import { Quiz } from '@module/quiz/domain/entities/quiz.entity';
import {
  IQuizRepository,
  QUIZ_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetAllQuizzesUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
  ) {
    console.log('[GetAllQuizzesUseCase] GetAllQuizzesUseCase 초기화');
  }

  async execute(): Promise<Quiz[]> {
    console.log('[GetAllQuizzesUseCase] 모든 Quiz 조회 실행');
    return await this.quizRepository.findAll();
  }
}

