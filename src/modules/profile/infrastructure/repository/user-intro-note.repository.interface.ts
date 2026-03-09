import { UserIntroNote } from '@module/profile/domain/entities/user-intro-note.entity';

export const USER_INTRO_NOTE_REPOSITORY_TOKEN = 'USER_INTRO_NOTE_REPOSITORY';

export interface IUserIntroNoteRepository {
    findByUserId(userId: string): Promise<UserIntroNote | null>;
    upsert(userId: string, answers: string[]): Promise<UserIntroNote>;
}
