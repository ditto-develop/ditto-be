import { ValidationException, BusinessRuleException } from '@common/exceptions/domain.exception';

export class QuizSet {
  constructor(
    public readonly id: string,
    public readonly year: number,
    public readonly month: number,
    public readonly week: number,
    public readonly category: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly isActive: boolean,
    public readonly matchingType: 'ONE_TO_ONE' | 'GROUP',
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    year: number,
    month: number,
    week: number,
    category: string,
    title: string,
    description: string | null,
    startDate: Date,
    endDate: Date,
    isActive: boolean = true,
    matchingType: 'ONE_TO_ONE' | 'GROUP' = 'ONE_TO_ONE',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ): QuizSet {
    // 비즈니스 규칙 검증
    if (year < 2000) {
      throw new BusinessRuleException('년도는 2000 이상이어야 합니다.');
    }

    if (month < 1 || month > 12) {
      throw new BusinessRuleException('월은 1에서 12 사이여야 합니다.');
    }

    if (week < 1) {
      throw new BusinessRuleException('주차는 1 이상이어야 합니다.');
    }

    if (!category || category.trim() === '') {
      throw new ValidationException('카테고리는 필수 값입니다.');
    }

    if (!title || title.trim() === '') {
      throw new ValidationException('제목은 필수 값입니다.');
    }

    if (startDate >= endDate) {
      throw new BusinessRuleException('종료일은 시작일보다 이후여야 합니다.');
    }

    if (matchingType !== 'ONE_TO_ONE' && matchingType !== 'GROUP') {
      throw new ValidationException('매칭 타입은 ONE_TO_ONE 또는 GROUP이어야 합니다.');
    }

    return new QuizSet(
      id,
      year,
      month,
      week,
      category,
      title,
      description,
      startDate,
      endDate,
      isActive,
      matchingType,
      createdAt,
      updatedAt,
    );
  }

  static createWithEndDate(
    id: string,
    year: number,
    month: number,
    week: number,
    category: string,
    title: string,
    description: string | null,
    startDate: Date,
    isActive: boolean = true,
    matchingType: 'ONE_TO_ONE' | 'GROUP' = 'ONE_TO_ONE',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ): QuizSet {
    // 시작일로부터 7일 후를 종료일로 설정
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    return QuizSet.create(
      id,
      year,
      month,
      week,
      category,
      title,
      description,
      startDate,
      endDate,
      isActive,
      matchingType,
      createdAt,
      updatedAt,
    );
  }

  update(
    year: number,
    month: number,
    week: number,
    category: string,
    title: string,
    description: string | null,
    startDate: Date,
    endDate: Date,
    isActive: boolean,
    matchingType: 'ONE_TO_ONE' | 'GROUP',
  ): QuizSet {
    return new QuizSet(
      this.id,
      year,
      month,
      week,
      category,
      title,
      description,
      startDate,
      endDate,
      isActive,
      matchingType,
      this.createdAt,
      new Date(),
    );
  }

  activate(): QuizSet {
    return new QuizSet(
      this.id,
      this.year,
      this.month,
      this.week,
      this.category,
      this.title,
      this.description,
      this.startDate,
      this.endDate,
      true,
      this.matchingType,
      this.createdAt,
      new Date(),
    );
  }

  deactivate(): QuizSet {
    return new QuizSet(
      this.id,
      this.year,
      this.month,
      this.week,
      this.category,
      this.title,
      this.description,
      this.startDate,
      this.endDate,
      false,
      this.matchingType,
      this.createdAt,
      new Date(),
    );
  }
}
