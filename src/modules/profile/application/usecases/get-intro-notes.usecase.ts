import { Inject, Injectable } from '@nestjs/common';
import {
    IUserIntroNoteRepository,
    USER_INTRO_NOTE_REPOSITORY_TOKEN,
} from '@module/profile/infrastructure/repository/user-intro-note.repository.interface';
import { IntroNotesDto } from '@module/profile/application/dto/intro-notes.dto';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class GetIntroNotesUseCase {
    constructor(
        @Inject(USER_INTRO_NOTE_REPOSITORY_TOKEN)
        private readonly introNoteRepo: IUserIntroNoteRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(userId: string): Promise<IntroNotesDto> {
        this.logger.log('소개 노트 조회', 'Profile:GetIntroNotesUseCase', { userId });

        const note = await this.introNoteRepo.findByUserId(userId);
        if (!note) return IntroNotesDto.empty();
        return IntroNotesDto.fromDomain(note);
    }
}
