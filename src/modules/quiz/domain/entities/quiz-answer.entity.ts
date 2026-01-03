export class QuizAnswer {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly quizId: string,
    public readonly choiceId: string,
    public readonly answeredAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    userId: string,
    quizId: string,
    choiceId: string,
    answeredAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ): QuizAnswer {
    return new QuizAnswer(id, userId, quizId, choiceId, answeredAt, updatedAt);
  }

  /**
   * 답변 수정
   */
  updateChoice(choiceId: string): QuizAnswer {
    return new QuizAnswer(this.id, this.userId, this.quizId, choiceId, this.answeredAt, new Date());
  }
}
