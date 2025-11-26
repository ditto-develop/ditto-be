export class Quiz {
  id: string;
  question: string;
  order: number;
  quizSetId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: QuizProps) {
    this.id = props.id;
    this.question = props.question;
    this.order = props.order;
    this.quizSetId = props.quizSetId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateQuizProps): Quiz {
    const now = new Date();
    return new Quiz({
      id: props.id,
      question: props.question,
      order: props.order,
      quizSetId: props.quizSetId,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(props: Partial<UpdateQuizProps>): Quiz {
    return new Quiz({
      ...this,
      ...props,
      updatedAt: new Date(),
    });
  }

  updateOrder(newOrder: number): Quiz {
    return new Quiz({
      ...this,
      order: newOrder,
      updatedAt: new Date(),
    });
  }
}

export interface QuizProps {
  id: string;
  question: string;
  order: number;
  quizSetId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuizProps {
  id: string;
  question: string;
  order: number;
  quizSetId: string;
}

export interface UpdateQuizProps {
  question?: string;
  order?: number;
}


