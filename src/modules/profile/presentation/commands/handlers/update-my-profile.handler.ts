import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { UpdateMyProfileCommand } from '@module/profile/presentation/commands/update-my-profile.command';
import { UpdateMyProfileUseCase } from '@module/profile/application/usecases/update-my-profile.usecase';
import { UserProfileDto } from '@module/profile/application/dto/user-profile.dto';

@Injectable()
@CommandHandler(UpdateMyProfileCommand)
export class UpdateMyProfileHandler implements ICommandHandler<UpdateMyProfileCommand, UserProfileDto> {
    constructor(private readonly useCase: UpdateMyProfileUseCase) {
        console.log('[Profile:UpdateMyProfileHandler] 초기화');
    }

    async execute(command: UpdateMyProfileCommand): Promise<ICommandResult<UserProfileDto>> {
        try {
            const profile = await this.useCase.execute(command.userId, command.dto);
            return { success: true, data: UserProfileDto.fromDomain(profile) };
        } catch (error) {
            const msg = error instanceof Error ? error.message : '알 수 없는 오류';
            console.error('[Profile:UpdateMyProfileHandler] 실패:', msg);
            return { success: false, error: msg };
        }
    }
}
