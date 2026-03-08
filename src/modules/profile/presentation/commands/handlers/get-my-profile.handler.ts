import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetMyProfileCommand } from '@module/profile/presentation/commands/get-my-profile.command';
import { GetMyProfileUseCase } from '@module/profile/application/usecases/get-my-profile.usecase';
import { UserProfileDto } from '@module/profile/application/dto/user-profile.dto';

@Injectable()
@CommandHandler(GetMyProfileCommand)
export class GetMyProfileHandler implements ICommandHandler<GetMyProfileCommand, UserProfileDto> {
    constructor(private readonly useCase: GetMyProfileUseCase) {
        console.log('[Profile:GetMyProfileHandler] 초기화');
    }

    async execute(command: GetMyProfileCommand): Promise<ICommandResult<UserProfileDto>> {
        try {
            const profile = await this.useCase.execute(command.userId);
            return { success: true, data: UserProfileDto.fromDomain(profile) };
        } catch (error) {
            const msg = error instanceof Error ? error.message : '알 수 없는 오류';
            console.error('[Profile:GetMyProfileHandler] 실패:', msg);
            return { success: false, error: msg };
        }
    }
}
