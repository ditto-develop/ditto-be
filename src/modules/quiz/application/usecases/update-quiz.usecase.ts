import { UpdateQuizDto } from '@module/quiz/application/dto/update-quiz.dto';
import { Quiz } from '@module/quiz/domain/entities/quiz.entity';
import { QuizFactory } from '@module/quiz/domain/factories/quiz.factory';
import { QuizNotFoundException } from '@module/quiz/domain/exceptions/quiz.exceptions';
import {
  IQuizRepository,
  QUIZ_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
  ) {}

  async execute(quizId: string, dto: UpdateQuizDto): Promise<Quiz> {
    console.log(`[UpdateQuizUseCase] Quiz 수정 시작: quizId=${quizId}`);

    // 기존 Quiz 조회
    const existingQuiz = await this.quizRepository.findById(quizId);
    if (!existingQuiz) {
      throw new QuizNotFoundException(quizId);
    }

    // 수정할 선택지 내용 추출
    let choiceContents: [string, string] | undefined;
    if (dto.choices) {
      choiceContents = [dto.choices[0].content, dto.choices[1].content];
    }

    // QuizFactory를 사용하여 수정된 Quiz 생성
    const updatedQuiz = QuizFactory.createUpdated(existingQuiz, dto.question, choiceContents, dto.order);

    const result = await this.quizRepository.update(updatedQuiz);

    console.log(`[UpdateQuizUseCase] Quiz 수정 완료: quizId=${quizId}`);
    return result;
  }
}
