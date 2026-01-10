import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { UserDto } from '@module/user/application/dto/user.dto';
import { UpdateUserUseCase } from '@module/user/application/usecases/update-user.usecase';
import { UpdateUserCommand } from '@module/user/presentation/commands/update-user.command';
import { Injectable, Inject } from '@nestjs/common';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

@Injectable()
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, UserDto> {
  constructor(
    private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {
    this.logger.log('UpdateUserHandler 초기화', 'UpdateUserHandler');
  }

  async execute(command: UpdateUserCommand): Promise<ICommandResult<UserDto>> {
    this.logger.log('사용자 정보 수정 Command 실행 시작', 'UpdateUserHandler', {
      targetUserId: command.id,
      currentUserId: command.currentUserId,
      updates: command.dto,
    });

    try {
      const user = await this.updateUserUseCase.execute(command.id, command.dto, command.currentUserId);
      const userDto = UserDto.fromDomain(user);

      this.logger.log('사용자 정보 수정 Command 실행 성공', 'UpdateUserHandler', {
        targetUserId: command.id,
        currentUserId: command.currentUserId,
        updatedFields: Object.keys(command.dto),
      });

      return {
        success: true,
        data: userDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';

      this.logger.error('사용자 정보 수정 Command 실행 실패', 'UpdateUserHandler', {
        targetUserId: command.id,
        currentUserId: command.currentUserId,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
