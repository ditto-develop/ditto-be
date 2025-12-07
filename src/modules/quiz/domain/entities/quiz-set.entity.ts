export class QuizSet {
  constructor(
    public readonly id: string,
    public readonly week: number,
    public readonly category: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    week: number,
    category: string,
    title: string,
    description: string | null,
    startDate: Date,
    endDate: Date,
    isActive: boolean = true,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ): QuizSet {
    // 비즈니스 규칙 검증
    if (week < 1) {
      throw new Error('주차는 1 이상이어야 합니다.');
    }

    if (!category || category.trim() === '') {
      throw new Error('카테고리는 필수 값입니다.');
    }

    if (!title || title.trim() === '') {
      throw new Error('제목은 필수 값입니다.');
    }

    if (startDate >= endDate) {
      throw new Error('종료일은 시작일보다 이후여야 합니다.');
    }

    return new QuizSet(id, week, category, title, description, startDate, endDate, isActive, createdAt, updatedAt);
  }

  static createWithEndDate(
    id: string,
    week: number,
    category: string,
    title: string,
    description: string | null,
    startDate: Date,
    isActive: boolean = true,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ): QuizSet {
    // 시작일로부터 7일 후를 종료일로 설정
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    return QuizSet.create(id, week, category, title, description, startDate, endDate, isActive, createdAt, updatedAt);
  }

  update(
    week: number,
    category: string,
    title: string,
    description: string | null,
    startDate: Date,
    endDate: Date,
    isActive: boolean,
  ): QuizSet {
    return new QuizSet(
      this.id,
      week,
      category,
      title,
      description,
      startDate,
      endDate,
      isActive,
      this.createdAt,
      new Date(),
    );
  }

  activate(): QuizSet {
    return new QuizSet(
      this.id,
      this.week,
      this.category,
      this.title,
      this.description,
      this.startDate,
      this.endDate,
      true,
      this.createdAt,
      new Date(),
    );
  }

  deactivate(): QuizSet {
    return new QuizSet(
      this.id,
      this.week,
      this.category,
      this.title,
      this.description,
      this.startDate,
      this.endDate,
      false,
      this.createdAt,
      new Date(),
    );
  }
}
