import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { UserSocialAccountDto } from '@module/user/application/dto/user.dto';
import { AddSocialAccountUseCase } from '@module/user/application/usecases/add-social-account.usecase';
import { AddSocialAccountCommand } from '@module/user/presentation/commands/add-social-account.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(AddSocialAccountCommand)
export class AddSocialAccountHandler implements ICommandHandler<AddSocialAccountCommand, UserSocialAccountDto> {
  constructor(private readonly addSocialAccountUseCase: AddSocialAccountUseCase) {
    console.log('[AddSocialAccountHandler] AddSocialAccountHandler 초기화');
  }

  async execute(command: AddSocialAccountCommand): Promise<ICommandResult<UserSocialAccountDto>> {
    console.log(`[AddSocialAccountHandler] Command 실행 시작: userId=${command.userId}, currentUserId=${command.currentUserId}`);

    try {
      const socialAccount = await this.addSocialAccountUseCase.execute(command.userId, command.dto, command.currentUserId);
      const socialAccountDto = UserSocialAccountDto.fromDomain(socialAccount);

      console.log(`[AddSocialAccountHandler] Command 실행 완료: 소셜 계정 추가 성공`);
      return {
        success: true,
        data: socialAccountDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[AddSocialAccountHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
