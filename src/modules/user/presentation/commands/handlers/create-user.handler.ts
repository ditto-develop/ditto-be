import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { UserDto } from '@module/user/application/dto/user.dto';
import { CreateUserUseCase } from '@module/user/application/usecases/create-user.usecase';
import { CreateUserCommand } from '@module/user/presentation/commands/create-user.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, UserDto> {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {
    console.log('[CreateUserHandler] CreateUserHandler 초기화');
  }

  async execute(command: CreateUserCommand): Promise<ICommandResult<UserDto>> {
    console.log('[CreateUserHandler] Command 실행 시작');

    try {
      const user = await this.createUserUseCase.execute(command.dto);
      const userDto = UserDto.fromDomain(user);

      console.log(`[CreateUserHandler] Command 실행 완료: 사용자 계정 생성 성공`);
      return {
        success: true,
        data: userDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[CreateUserHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
