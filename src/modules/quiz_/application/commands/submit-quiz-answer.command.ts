export class SubmitQuizAnswerCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly quizId: string,
    public readonly choiceId: string,
  ) {}
}


