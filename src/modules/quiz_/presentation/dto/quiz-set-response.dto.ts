export class QuizSetResponseDto {
  id: string;
  week: number;
  category: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;

  static fromEntity(entity: any): QuizSetResponseDto {
    return {
      id: entity.id,
      week: entity.week,
      category: entity.category,
      title: entity.title,
      description: entity.description,
      startDate: entity.startDate,
      endDate: entity.endDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      isActive: entity.isActive(),
    };
  }
}


