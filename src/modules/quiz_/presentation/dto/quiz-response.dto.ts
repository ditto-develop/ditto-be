export class QuizResponseDto {
  id: string;
  question: string;
  order: number;
  quizSetId: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: any): QuizResponseDto {
    return {
      id: entity.id,
      question: entity.question,
      order: entity.order,
      quizSetId: entity.quizSetId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
