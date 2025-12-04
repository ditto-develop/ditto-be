import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { UserDto } from '@module/user/application/dto/user.dto';
import { LeaveUserUseCase } from '@module/user/application/usecases/leave-user.usecase';
import { LeaveUserCommand } from '@module/user/presentation/commands/leave-user.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(LeaveUserCommand)
export class LeaveUserHandler implements ICommandHandler<LeaveUserCommand, UserDto> {
  constructor(private readonly leaveUserUseCase: LeaveUserUseCase) {
    console.log('[LeaveUserHandler] LeaveUserHandler 초기화');
  }

  async execute(command: LeaveUserCommand): Promise<ICommandResult<UserDto>> {
    console.log(`[LeaveUserHandler] Command 실행 시작: id=${command.id}`);

    try {
      // TODO: 인증 시스템 구현 후 currentUser 조회 로직 추가
      const currentUser = { id: command.currentUserId, isAdmin: () => false } as any; // 임시

      const user = await this.leaveUserUseCase.execute(command.id, currentUser);
      const userDto = UserDto.fromDomain(user);

      console.log(`[LeaveUserHandler] Command 실행 완료: 사용자 탈퇴 처리 성공`);
      return {
        success: true,
        data: userDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[LeaveUserHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
