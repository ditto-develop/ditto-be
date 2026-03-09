import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { UpdateIntroNotesCommand } from '@module/profile/presentation/commands/update-intro-notes.command';
import { UpdateIntroNotesUseCase } from '@module/profile/application/usecases/update-intro-notes.usecase';
import { IntroNotesDto } from '@module/profile/application/dto/intro-notes.dto';

@Injectable()
@CommandHandler(UpdateIntroNotesCommand)
export class UpdateIntroNotesHandler implements ICommandHandler<UpdateIntroNotesCommand, IntroNotesDto> {
    constructor(private readonly useCase: UpdateIntroNotesUseCase) {
        console.log('[Profile:UpdateIntroNotesHandler] 초기화');
    }

    async execute(command: UpdateIntroNotesCommand): Promise<ICommandResult<IntroNotesDto>> {
        try {
            const data = await this.useCase.execute(command.userId, command.dto);
            return { success: true, data };
        } catch (error) {
            const msg = error instanceof Error ? error.message : '알 수 없는 오류';
            console.error('[Profile:UpdateIntroNotesHandler] 실패:', msg);
            return { success: false, error: msg };
        }
    }
}
