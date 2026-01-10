import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { CheckNicknameAvailabilityUseCase } from '@module/user/application/usecases/check-nickname-availability.usecase';
import { CheckNicknameAvailabilityCommand } from '@module/user/presentation/commands/check-nickname-availability.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(CheckNicknameAvailabilityCommand)
export class CheckNicknameAvailabilityHandler implements ICommandHandler<CheckNicknameAvailabilityCommand, { available: boolean }> {
  constructor(private readonly checkNicknameAvailabilityUseCase: CheckNicknameAvailabilityUseCase) {
    console.log('[CheckNicknameAvailabilityHandler] CheckNicknameAvailabilityHandler 초기화');
  }

  async execute(command: CheckNicknameAvailabilityCommand): Promise<ICommandResult<{ available: boolean }>> {
    console.log('[CheckNicknameAvailabilityHandler] Command 실행 시작');

    try {
      const result = await this.checkNicknameAvailabilityUseCase.execute(command.nickname);

      console.log(`[CheckNicknameAvailabilityHandler] Command 실행 완료: 닉네임 사용 가능 여부 확인 성공`);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[CheckNicknameAvailabilityHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}