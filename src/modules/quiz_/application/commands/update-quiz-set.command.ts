export class UpdateQuizSetCommand {
  constructor(
    public readonly id: string,
    public readonly week?: number,
    public readonly category?: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly startDate?: Date,
  ) {}
}


