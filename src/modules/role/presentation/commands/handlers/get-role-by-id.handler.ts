import { GetRoleByIdUseCase } from './../../../application/usecases/get-role-by-id.usecase';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { RoleDto } from '@module/role/application/dto/role.dto';
import { GetRoleByIdCommand } from '@module/role/presentation/commands/get-role-by-id.command';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(GetRoleByIdCommand)
export class GetRoleByIdHandler implements ICommandHandler<GetRoleByIdCommand, RoleDto> {
  constructor(private readonly getRoleByIdUseCase: GetRoleByIdUseCase) {
    console.log('[GetRoleByIdHandler] GetRoleByIdHandler 초기화');
  }

  async execute(command: GetRoleByIdCommand): Promise<ICommandResult<RoleDto>> {
    console.log(`[GetRoleByIdHandler] Command 실행 시작: id=${command.id}`);

    try {
      const role = await this.getRoleByIdUseCase.execute(command.id);
      const roleDto = RoleDto.fromDomain(role);

      console.log(`[GetRoleByIdHandler] Command 실행 완료: Role 조회 성공`);
      return {
        success: true,
        data: roleDto,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error(`[GetRoleByIdHandler] Command 실행 실패:`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
