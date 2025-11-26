export class QuizSet {
  id: string;
  week: number;
  category: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: QuizSetProps) {
    this.id = props.id;
    this.week = props.week;
    this.category = props.category;
    this.title = props.title;
    this.description = props.description;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateQuizSetProps): QuizSet {
    const now = new Date();
    const endDate = new Date(props.startDate);
    endDate.setDate(endDate.getDate() + 7); // 7일 후

    return new QuizSet({
      id: props.id,
      week: props.week,
      category: props.category,
      title: props.title,
      description: props.description,
      startDate: props.startDate,
      endDate,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(props: Partial<UpdateQuizSetProps>): QuizSet {
    return new QuizSet({
      ...this,
      ...props,
      updatedAt: new Date(),
    });
  }

  isActive(): boolean {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
  }
}

export interface QuizSetProps {
  id: string;
  week: number;
  category: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuizSetProps {
  id: string;
  week: number;
  category: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateQuizSetProps {
  week?: number;
  category?: string;
  title?: string;
  description?: string;
  startDate?: Date;
}
