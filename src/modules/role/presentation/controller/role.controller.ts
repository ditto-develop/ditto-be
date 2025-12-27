import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { ICommandResult } from '@common/command/command.interface';
import { RoleDto } from '@module/role/application/dto/role.dto';
import { GetAllRolesCommand } from '@module/role/presentation/commands/get-all-roles.command';
import { GetRoleByIdCommand } from '@module/role/presentation/commands/get-role-by-id.command';
import { JwtAuthGuard } from '@module/user/infrastructure/guards/jwt-auth.guard';

@ApiTags('Role')
@Controller('roles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly commandBus: CommandBus) {
    console.log('[RoleController] RoleController 초기화');
  }

  @Get()
  @ApiOperation({ summary: '모든 Role 조회', description: '모든 Role을 조회합니다.' })
  @ApiCommandResponse(200, '모든 Role 조회 성공', RoleDto, true)
  async findAll(): Promise<ICommandResult<RoleDto[]>> {
    console.log('[RoleController] 모든 Role 조회 요청');
    const command = new GetAllRolesCommand();
    return await this.commandBus.execute<RoleDto[]>(command);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Role 조회', description: 'ID로 특정 Role을 조회합니다.' })
  @ApiParam({ name: 'id', type: 'number', description: 'Role ID' })
  @ApiCommandResponse(200, 'Role 조회 성공', RoleDto, false)
  @ApiCommandResponse(404, 'Role을 찾을 수 없음')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ICommandResult<RoleDto>> {
    console.log(`[RoleController] Role 조회 요청: id=${id}`);
    const command = new GetRoleByIdCommand(id);
    return await this.commandBus.execute<RoleDto>(command);
  }
}
