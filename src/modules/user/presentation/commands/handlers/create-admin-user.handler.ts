import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { UserDto } from '@module/user/application/dto/user.dto';
import { CreateAdminUserUseCase } from '@module/user/application/usecases/create-admin-user.usecase';
import { CreateAdminUserCommand } from '@module/user/presentation/commands/create-admin-user.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(CreateAdminUserCommand)
export class CreateAdminUserHandler implements ICommandHandler<CreateAdminUserCommand, UserDto> {
  constructor(private readonly createAdminUserUseCase: CreateAdminUserUseCase) {
    console.log('[CreateAdminUserHandler] CreateAdminUserHandler 초기화');
  }

  async execute(command: CreateAdminUserCommand): Promise<ICommandResult<UserDto>> {
    console.log('[CreateAdminUserHandler] Command 실행 시작');

    try {
      const user = await this.createAdminUserUseCase.execute(command.dto);
      const userDto = UserDto.fromDomain(user);

      console.log(`[CreateAdminUserHandler] Command 실행 완료: 관리자 계정 생성 성공`);
      return {
        success: true,
        data: userDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[CreateAdminUserHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
