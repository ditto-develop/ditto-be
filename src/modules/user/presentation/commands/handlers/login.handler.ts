import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { LoginResponseDto } from '@module/user/application/dto/user.dto';
import { LoginUseCase } from '@module/user/application/usecases/login.usecase';
import { LoginCommand } from '@module/user/presentation/commands/login.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, LoginResponseDto> {
  constructor(private readonly loginUseCase: LoginUseCase) {
    console.log('[LoginHandler] LoginHandler 초기화');
  }

  async execute(command: LoginCommand): Promise<ICommandResult<LoginResponseDto>> {
    console.log('[LoginHandler] Command 실행 시작: 관리자 로그인');

    try {
      const result = await this.loginUseCase.executeAdminLogin(command.dto);

      console.log('[LoginHandler] Command 실행 완료: 관리자 로그인 성공');
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('[LoginHandler] Command 실행 실패:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
