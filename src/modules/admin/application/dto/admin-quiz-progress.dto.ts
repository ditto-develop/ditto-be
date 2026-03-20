export class AdminQuizProgressItemDto {
  userId: string;
  nickname: string;
  email: string;
  quizSetId: string;
  quizSetTitle: string;
  matchingType: string;
  status: string;
  totalQuizzes: number;
  completedAt: Date | null;
  selectedAt: Date;
  groupDeclined: boolean;
  groupJoined: boolean;
}

export class AdminQuizProgressResponseDto {
  year: number;
  month: number;
  week: number;
  items: AdminQuizProgressItemDto[];
  total: number;
}
