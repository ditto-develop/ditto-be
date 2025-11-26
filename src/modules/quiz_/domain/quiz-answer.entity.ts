export class QuizAnswer {
  id: string;
  userId: string;
  quizId: string;
  choiceId: string;
  answeredAt: Date;

  constructor(props: QuizAnswerProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.quizId = props.quizId;
    this.choiceId = props.choiceId;
    this.answeredAt = props.answeredAt;
  }

  static create(props: CreateQuizAnswerProps): QuizAnswer {
    return new QuizAnswer({
      id: props.id,
      userId: props.userId,
      quizId: props.quizId,
      choiceId: props.choiceId,
      answeredAt: new Date(),
    });
  }
}

export interface QuizAnswerProps {
  id: string;
  userId: string;
  quizId: string;
  choiceId: string;
  answeredAt: Date;
}

export interface CreateQuizAnswerProps {
  id: string;
  userId: string;
  quizId: string;
  choiceId: string;
}


