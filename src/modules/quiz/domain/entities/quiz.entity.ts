export class Quiz {
  constructor(
    public readonly id: string,
    public readonly question: string,
    public readonly order: number,
    public readonly quizSetId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    question: string,
    order: number,
    quizSetId: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ): Quiz {
    return new Quiz(id, question, order, quizSetId, createdAt, updatedAt);
  }

  update(question: string, order: number): Quiz {
    return new Quiz(this.id, question, order, this.quizSetId, this.createdAt, new Date());
  }

  updateOrder(newOrder: number): Quiz {
    return new Quiz(this.id, this.question, newOrder, this.quizSetId, this.createdAt, new Date());
  }
}
