import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { LoginResponseDto } from '@module/user/application/dto/user.dto';
import { RefreshAccessTokenUseCase } from '@module/user/application/usecases/refresh-access-token.usecase';
import { RefreshAccessTokenCommand } from '@module/user/presentation/commands/refresh-access-token.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(RefreshAccessTokenCommand)
export class RefreshAccessTokenHandler implements ICommandHandler<RefreshAccessTokenCommand, LoginResponseDto> {
  constructor(private readonly useCase: RefreshAccessTokenUseCase) {}

  async execute(command: RefreshAccessTokenCommand): Promise<ICommandResult<LoginResponseDto>> {
    try {
      const result = await this.useCase.execute(command.refreshToken);
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return { success: false, error: message };
    }
  }
}
