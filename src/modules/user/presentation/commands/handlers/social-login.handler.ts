import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { LoginResponseDto } from '@module/user/application/dto/user.dto';
import { LoginUseCase } from '@module/user/application/usecases/login.usecase';
import { SocialLoginCommand } from '@module/user/presentation/commands/social-login.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(SocialLoginCommand)
export class SocialLoginHandler implements ICommandHandler<SocialLoginCommand, LoginResponseDto> {
  constructor(private readonly loginUseCase: LoginUseCase) {
    console.log('[SocialLoginHandler] SocialLoginHandler 초기화');
  }

  async execute(command: SocialLoginCommand): Promise<ICommandResult<LoginResponseDto>> {
    console.log('[SocialLoginHandler] Command 실행 시작: 소셜 로그인');

    try {
      const result = await this.loginUseCase.executeSocialLogin(command.dto);

      console.log('[SocialLoginHandler] Command 실행 완료: 소셜 로그인 성공');
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('[SocialLoginHandler] Command 실행 실패:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
