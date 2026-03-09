import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetIntroNotesCommand } from '@module/profile/presentation/commands/get-intro-notes.command';
import { GetIntroNotesUseCase } from '@module/profile/application/usecases/get-intro-notes.usecase';
import { IntroNotesDto } from '@module/profile/application/dto/intro-notes.dto';

@Injectable()
@CommandHandler(GetIntroNotesCommand)
export class GetIntroNotesHandler implements ICommandHandler<GetIntroNotesCommand, IntroNotesDto> {
    constructor(private readonly useCase: GetIntroNotesUseCase) {
        console.log('[Profile:GetIntroNotesHandler] 초기화');
    }

    async execute(command: GetIntroNotesCommand): Promise<ICommandResult<IntroNotesDto>> {
        try {
            const data = await this.useCase.execute(command.userId);
            return { success: true, data };
        } catch (error) {
            const msg = error instanceof Error ? error.message : '알 수 없는 오류';
            console.error('[Profile:GetIntroNotesHandler] 실패:', msg);
            return { success: false, error: msg };
        }
    }
}
