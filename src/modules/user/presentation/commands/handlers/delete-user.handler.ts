import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { DeleteUserUseCase } from '@module/user/application/usecases/delete-user.usecase';
import { DeleteUserCommand } from '@module/user/presentation/commands/delete-user.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, void> {
  constructor(private readonly deleteUserUseCase: DeleteUserUseCase) {
    console.log('[DeleteUserHandler] DeleteUserHandler 초기화');
  }

  async execute(command: DeleteUserCommand): Promise<ICommandResult<void>> {
    console.log(`[DeleteUserHandler] Command 실행 시작: id=${command.id}`);

    // TODO: 인증 시스템 구현 후 currentUser 조회 로직 추가
    const currentUser = { isAdmin: () => true } as any; // 임시

    await this.deleteUserUseCase.execute(command.id, currentUser);

    console.log(`[DeleteUserHandler] Command 실행 완료: 사용자 삭제 성공`);
    return { success: true, data: undefined };
  }
}
