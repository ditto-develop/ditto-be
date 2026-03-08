import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetUserProfileCommand } from '@module/profile/presentation/commands/get-user-profile.command';
import { GetUserProfileUseCase } from '@module/profile/application/usecases/get-user-profile.usecase';
import { PublicProfileDto } from '@module/profile/application/dto/public-profile.dto';

@Injectable()
@CommandHandler(GetUserProfileCommand)
export class GetUserProfileHandler implements ICommandHandler<GetUserProfileCommand, PublicProfileDto> {
    constructor(private readonly useCase: GetUserProfileUseCase) {
        console.log('[Profile:GetUserProfileHandler] 초기화');
    }

    async execute(command: GetUserProfileCommand): Promise<ICommandResult<PublicProfileDto>> {
        try {
            const publicProfile = await this.useCase.execute(command.targetUserId);
            return { success: true, data: publicProfile };
        } catch (error) {
            const msg = error instanceof Error ? error.message : '알 수 없는 오류';
            console.error('[Profile:GetUserProfileHandler] 실패:', msg);
            return { success: false, error: msg };
        }
    }
}
