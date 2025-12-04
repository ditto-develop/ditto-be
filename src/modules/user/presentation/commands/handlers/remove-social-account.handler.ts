import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { RemoveSocialAccountUseCase } from '@module/user/application/usecases/remove-social-account.usecase';
import { RemoveSocialAccountCommand } from '../remove-social-account.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(RemoveSocialAccountCommand)
export class RemoveSocialAccountHandler implements ICommandHandler<RemoveSocialAccountCommand, void> {
  constructor(private readonly removeSocialAccountUseCase: RemoveSocialAccountUseCase) {
    console.log('[RemoveSocialAccountHandler] RemoveSocialAccountHandler 초기화');
  }

  async execute(command: RemoveSocialAccountCommand): Promise<ICommandResult<void>> {
    console.log(`[RemoveSocialAccountHandler] Command 실행 시작: userId=${command.userId}, provider=${command.provider}`);

    try {
      // TODO: 인증 시스템 구현 후 currentUser 조회 로직 추가
      const currentUser = { id: command.currentUserId } as any; // 임시

      await this.removeSocialAccountUseCase.execute(command.userId, command.provider, currentUser);

      console.log(`[RemoveSocialAccountHandler] Command 실행 완료: 소셜 계정 제거 성공`);
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[RemoveSocialAccountHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
