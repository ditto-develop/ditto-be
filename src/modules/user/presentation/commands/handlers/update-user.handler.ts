import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { UserDto } from '@module/user/application/dto/user.dto';
import { UpdateUserUseCase } from '@module/user/application/usecases/update-user.usecase';
import { UpdateUserCommand } from '@module/user/presentation/commands/update-user.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, UserDto> {
  constructor(private readonly updateUserUseCase: UpdateUserUseCase) {
    console.log('[UpdateUserHandler] UpdateUserHandler 초기화');
  }

  async execute(command: UpdateUserCommand): Promise<ICommandResult<UserDto>> {
    console.log(`[UpdateUserHandler] Command 실행 시작: id=${command.id}`);

    try {
      // TODO: 인증 시스템 구현 후 currentUser 조회 로직 추가
      const currentUser = { id: command.currentUserId } as any; // 임시

      const user = await this.updateUserUseCase.execute(command.id, command.dto, currentUser);
      const userDto = UserDto.fromDomain(user);

      console.log(`[UpdateUserHandler] Command 실행 완료: 사용자 정보 수정 성공`);
      return {
        success: true,
        data: userDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[UpdateUserHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
