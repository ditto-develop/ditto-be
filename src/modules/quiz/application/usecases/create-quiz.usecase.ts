import { Inject, Injectable } from '@nestjs/common';
import { CreateQuizDto } from 'src/modules/quiz/application/dto/create-quiz.dto';
import { Quiz } from 'src/modules/quiz/domain/entities/quiz.entity';
import {
  IQuizRepository,
  QUIZ_REPOSITORY_TOKEN,
} from 'src/modules/quiz/infrastructure/repository/quiz.repository.interface';
import {
  IQuizSetRepository,
  QUIZ_SET_REPOSITORY_TOKEN,
} from 'src/modules/quiz/infrastructure/repository/quiz-set.repository.interface';

@Injectable()
export class CreateQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {
    console.log('[CreateQuizUseCase] CreateQuizUseCase 초기화');
  }

  async execute(dto: CreateQuizDto): Promise<Quiz> {
    console.log(`[CreateQuizUseCase] Quiz 생성 시작: question=${dto.question}`);

    // QuizSet이 존재하는지 확인
    const quizSet = await this.quizSetRepository.findById(dto.quizSetId);
    if (!quizSet) {
      throw new Error(`QuizSet을 찾을 수 없습니다: ${dto.quizSetId}`);
    }

    // 퀴즈 세트에 이미 12개의 퀴즈가 있는지 확인
    const quizCount = await this.quizSetRepository.countQuizzes(dto.quizSetId);
    if (quizCount >= 12) {
      throw new Error(
        `퀴즈 세트에 이미 12개의 퀴즈가 있습니다. 최대 12개까지 추가할 수 있습니다.`,
      );
    }

    const quiz = Quiz.create('', dto.question, dto.order, dto.quizSetId);

    const created = await this.quizRepository.create(quiz);

    console.log(`[CreateQuizUseCase] Quiz 생성 완료: id=${created.id}`);
    return created;
  }
}
