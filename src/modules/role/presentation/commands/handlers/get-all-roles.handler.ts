import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { RoleDto } from '@module/role/application/dto/role.dto';
import { GetAllRolesUseCase } from '@module/role/application/usecases/get-all-roles.usecase';
import { GetAllRolesCommand } from '@module/role/presentation/commands/get-all-roles.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(GetAllRolesCommand)
export class GetAllRolesHandler implements ICommandHandler<GetAllRolesCommand, RoleDto[]> {
  constructor(private readonly getAllRolesUseCase: GetAllRolesUseCase) {
    console.log('[GetAllRolesHandler] GetAllRolesHandler 초기화');
  }
  async execute(_: GetAllRolesCommand): Promise<ICommandResult<RoleDto[]>> {
    console.log('[GetAllRolesHandler] Command 실행 시작');

    try {
      const roles = await this.getAllRolesUseCase.execute();
      const roleDtos = roles.map((role) => RoleDto.fromDomain(role));

      console.log(`[GetAllRolesHandler] Command 실행 완료: ${roleDtos.length}개 Role 조회`);
      return {
        success: true,
        data: roleDtos,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
