export class GetQuizSetQuery {
  constructor(
    public readonly id: string,
  ) {}
}

export class GetQuizSetsByWeekAndCategoryQuery {
  constructor(
    public readonly week: number,
    public readonly category: string,
  ) {}
}

export class GetAllQuizSetsQuery {}


