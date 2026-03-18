import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { LoginResponseDto } from '@module/user/application/dto/user.dto';
import { LoginUseCase } from '@module/user/application/usecases/login.usecase';
import { LocalLoginCommand } from '@module/user/presentation/commands/local-login.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(LocalLoginCommand)
export class LocalLoginHandler implements ICommandHandler<LocalLoginCommand, LoginResponseDto> {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  async execute(command: LocalLoginCommand): Promise<ICommandResult<LoginResponseDto>> {
    try {
      const result = await this.loginUseCase.executeLocalLogin(command.dto);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return { success: false, error: errorMessage };
    }
  }
}
