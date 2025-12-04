import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { UserDto } from '@module/user/application/dto/user.dto';
import { GetUserByIdUseCase } from '@module/user/application/usecases/get-user-by-id.usecase';
import { GetUserByIdCommand } from '@module/user/presentation/commands/get-user-by-id.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(GetUserByIdCommand)
export class GetUserByIdHandler implements ICommandHandler<GetUserByIdCommand, UserDto> {
  constructor(private readonly getUserByIdUseCase: GetUserByIdUseCase) {
    console.log('[GetUserByIdHandler] GetUserByIdHandler 초기화');
  }

  async execute(command: GetUserByIdCommand): Promise<ICommandResult<UserDto>> {
    console.log(`[GetUserByIdHandler] Command 실행 시작: id=${command.id}`);

    try {
      const user = await this.getUserByIdUseCase.execute(command.id);
      const userDto = UserDto.fromDomain(user);

      console.log(`[GetUserByIdHandler] Command 실행 완료: 사용자 조회 성공`);
      return {
        success: true,
        data: userDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[GetUserByIdHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
