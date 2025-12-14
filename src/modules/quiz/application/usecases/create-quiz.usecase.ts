import { CreateQuizDto } from '@module/quiz/application/dto/create-quiz.dto';
import { Quiz } from '@module/quiz/domain/entities/quiz.entity';
import { QuizFactory } from '@module/quiz/domain/factories/quiz.factory';
import { QuizOrderStrategyFactory } from '@module/quiz/domain/strategies/quiz-order.strategy';
import {
  QuizSetLimitExceededException,
  QuizSetNotFoundException,
} from '@module/quiz/domain/exceptions/quiz.exceptions';
import {
  IQuizSetRepository,
  QUIZ_SET_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz-set.repository.interface';
import {
  IQuizRepository,
  QUIZ_REPOSITORY_TOKEN,
} from '@module/quiz/infrastructure/repository/quiz.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY_TOKEN)
    private readonly quizRepository: IQuizRepository,
    @Inject(QUIZ_SET_REPOSITORY_TOKEN)
    private readonly quizSetRepository: IQuizSetRepository,
  ) {}

  async execute(dto: CreateQuizDto): Promise<Quiz> {
    console.log(`[CreateQuizUseCase] Quiz 생성 시작: question=${dto.question}`);

    // QuizSet이 존재하는지 확인
    const quizSet = await this.quizSetRepository.findById(dto.quizSetId);
    if (!quizSet) {
      throw new QuizSetNotFoundException(dto.quizSetId);
    }

    // 퀴즈 세트에 이미 12개의 퀴즈가 있는지 확인
    const quizCount = await this.quizSetRepository.countQuizzes(dto.quizSetId);
    if (quizCount >= 12) {
      throw new QuizSetLimitExceededException();
    }

    // 순서 전략 생성 (자동 또는 수동)
    const orderStrategy = QuizOrderStrategyFactory.create(dto.order, (quizSetId) =>
      this.quizRepository.findMaxOrderByQuizSetId(quizSetId),
    );

    // 순서 할당
    const assignedOrder = await orderStrategy.assignOrder(dto.quizSetId);

    // 선택지 내용 추출
    const choiceContents: [string, string] = [dto.choices[0].content, dto.choices[1].content];

    // UUID로 ID 생성
    const quizId = uuidv4();

    // QuizFactory를 사용하여 Quiz 생성
    const quiz = QuizFactory.create(quizId, dto.question, choiceContents, assignedOrder, dto.quizSetId);

    const created = await this.quizRepository.create(quiz);

    console.log(`[CreateQuizUseCase] Quiz 생성 완료: id=${created.id}`);
    return created;
  }
}
