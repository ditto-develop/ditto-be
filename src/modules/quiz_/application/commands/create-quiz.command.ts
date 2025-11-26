export class CreateQuizCommand {
  constructor(
    public readonly id: string,
    public readonly question: string,
    public readonly quizSetId: string,
    public readonly order?: number,
  ) {}
}


