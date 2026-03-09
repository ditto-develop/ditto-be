import { ValidationException } from '@common/exceptions/domain.exception';

export const INTRO_NOTE_COUNT = 10;
export const INTRO_NOTE_MAX_LENGTH = 200;

export class UserIntroNote {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly answers: string[],
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }

    static create(
        id: string,
        userId: string,
        answers: string[] = Array(INTRO_NOTE_COUNT).fill(''),
        createdAt: Date = new Date(),
        updatedAt: Date = new Date(),
    ): UserIntroNote {
        const note = new UserIntroNote(id, userId, answers, createdAt, updatedAt);
        note.validate();
        return note;
    }

    static empty(id: string, userId: string): UserIntroNote {
        return UserIntroNote.create(id, userId, Array(INTRO_NOTE_COUNT).fill(''));
    }

    get completedCount(): number {
        return this.answers.filter((a) => a.trim().length > 0).length;
    }

    validate(): void {
        if (this.answers.length !== INTRO_NOTE_COUNT) {
            throw new ValidationException(
                `소개 노트는 정확히 ${INTRO_NOTE_COUNT}개의 답변이 필요합니다.`,
            );
        }
        for (const answer of this.answers) {
            if (answer.length > INTRO_NOTE_MAX_LENGTH) {
                throw new ValidationException(
                    `각 답변은 최대 ${INTRO_NOTE_MAX_LENGTH}자까지 입력할 수 있습니다.`,
                );
            }
        }
    }
}
