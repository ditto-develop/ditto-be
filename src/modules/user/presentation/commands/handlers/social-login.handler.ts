import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { LoginResponseDto } from '@module/user/application/dto/user.dto';
import { LoginUseCase } from '@module/user/application/usecases/login.usecase';
import { SocialLoginCommand } from '@module/user/presentation/commands/social-login.command';
import { Injectable, Inject } from '@nestjs/common';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
@CommandHandler(SocialLoginCommand)
export class SocialLoginHandler implements ICommandHandler<SocialLoginCommand, LoginResponseDto> {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {
    this.logger.log('SocialLoginHandler 초기화', 'SocialLoginHandler');
  }

  async execute(command: SocialLoginCommand): Promise<ICommandResult<LoginResponseDto>> {
    this.logger.log('소셜 로그인 Command 실행 시작', 'SocialLoginHandler', {
      provider: command.dto.provider,
      providerUserId: command.dto.providerUserId,
    });

    try {
      const result = await this.loginUseCase.executeSocialLogin(command.dto);

      this.logger.log('소셜 로그인 Command 실행 성공', 'SocialLoginHandler', {
        userId: result.user.id,
        username: result.user.nickname,
        provider: command.dto.provider,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';

      this.logger.error('소셜 로그인 Command 실행 실패', 'SocialLoginHandler', {
        provider: command.dto.provider,
        providerUserId: command.dto.providerUserId,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
