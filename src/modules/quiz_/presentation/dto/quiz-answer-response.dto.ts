export class QuizAnswerResponseDto {
  id: string;
  userId: string;
  quizId: string;
  choiceId: string;
  answeredAt: Date;

  static fromEntity(entity: any): QuizAnswerResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      quizId: entity.quizId,
      choiceId: entity.choiceId,
      answeredAt: entity.answeredAt,
    };
  }
}


