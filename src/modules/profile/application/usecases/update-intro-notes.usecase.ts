import { Inject, Injectable } from '@nestjs/common';
import {
    IUserIntroNoteRepository,
    USER_INTRO_NOTE_REPOSITORY_TOKEN,
} from '@module/profile/infrastructure/repository/user-intro-note.repository.interface';
import { IntroNotesDto, UpdateIntroNotesDto } from '@module/profile/application/dto/intro-notes.dto';
import { UserIntroNote } from '@module/profile/domain/entities/user-intro-note.entity';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
export class UpdateIntroNotesUseCase {
    constructor(
        @Inject(USER_INTRO_NOTE_REPOSITORY_TOKEN)
        private readonly introNoteRepo: IUserIntroNoteRepository,
        @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
    ) { }

    async execute(userId: string, dto: UpdateIntroNotesDto): Promise<IntroNotesDto> {
        this.logger.log('소개 노트 저장', 'Profile:UpdateIntroNotesUseCase', { userId });

        // 도메인 검증 (길이, 글자 수)
        const validated = UserIntroNote.create('', userId, dto.answers);

        const saved = await this.introNoteRepo.upsert(userId, validated.answers);
        return IntroNotesDto.fromDomain(saved);
    }
}
