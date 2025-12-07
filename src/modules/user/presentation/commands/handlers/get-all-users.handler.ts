import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { UserDto } from '@module/user/application/dto/user.dto';
import { GetAllUsersUseCase } from '@module/user/application/usecases/get-all-users.usecase';
import { GetAllUsersCommand } from '@module/user/presentation/commands/get-all-users.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(GetAllUsersCommand)
export class GetAllUsersHandler implements ICommandHandler<GetAllUsersCommand, UserDto[]> {
  constructor(private readonly getAllUsersUseCase: GetAllUsersUseCase) {
    console.log('[GetAllUsersHandler] GetAllUsersHandler 초기화');
  }

  async execute(command: GetAllUsersCommand): Promise<ICommandResult<UserDto[]>> {
    console.log(`[GetAllUsersHandler] Command 실행 시작: requestUserId=${command.requestUserId}`);

    try {
      const users = await this.getAllUsersUseCase.execute(command.requestUserId);
      const userDtos = users.map((user) => UserDto.fromDomain(user));

      console.log(`[GetAllUsersHandler] Command 실행 완료: ${userDtos.length}개 사용자 조회`);
      return {
        success: true,
        data: userDtos,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[GetAllUsersHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
