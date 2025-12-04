import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { UserDto } from '@module/user/application/dto/user.dto';
import { GetMyProfileUseCase } from '@module/user/application/usecases/get-my-profile.usecase';
import { GetMyProfileCommand } from '@module/user/presentation/commands/get-my-profile.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(GetMyProfileCommand)
export class GetMyProfileHandler implements ICommandHandler<GetMyProfileCommand, UserDto> {
  constructor(private readonly getMyProfileUseCase: GetMyProfileUseCase) {
    console.log('[GetMyProfileHandler] GetMyProfileHandler 초기화');
  }

  async execute(command: GetMyProfileCommand): Promise<ICommandResult<UserDto>> {
    console.log(`[GetMyProfileHandler] Command 실행 시작: userId=${command.userId}`);

    try {
      const user = await this.getMyProfileUseCase.execute(command.userId);
      const userDto = UserDto.fromDomain(user);

      console.log(`[GetMyProfileHandler] Command 실행 완료: 본인 프로필 조회 성공`);
      return {
        success: true,
        data: userDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[GetMyProfileHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
