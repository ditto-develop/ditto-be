export class Choice {
  id: string;
  text: string;
  quizId: string;
  order: number;

  constructor(props: ChoiceProps) {
    this.id = props.id;
    this.text = props.text;
    this.quizId = props.quizId;
    this.order = props.order;
  }

  static create(props: CreateChoiceProps): Choice {
    return new Choice({
      id: props.id,
      text: props.text,
      quizId: props.quizId,
      order: props.order,
    });
  }

  update(props: Partial<UpdateChoiceProps>): Choice {
    return new Choice({
      ...this,
      ...props,
    });
  }
}

export interface ChoiceProps {
  id: string;
  text: string;
  quizId: string;
  order: number;
}

export interface CreateChoiceProps {
  id: string;
  text: string;
  quizId: string;
  order: number;
}

export interface UpdateChoiceProps {
  text?: string;
  order?: number;
}


