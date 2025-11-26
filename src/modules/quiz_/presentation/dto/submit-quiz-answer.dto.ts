import { IsString } from 'class-validator';

export class SubmitQuizAnswerDto {
  @IsString()
  id: string;

  @IsString()
  userId: string;

  @IsString()
  quizId: string;

  @IsString()
  choiceId: string;
}


