import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { ICommandResult } from '@common/command/command.interface';
import { JwtAuthGuard } from '@module/user/infrastructure/guards/jwt-auth.guard';
import { SystemStateDto } from '@module/system/application/dto/system-state.dto';
import { GetSystemStateCommand } from '../commands/get-system-state.command';

@ApiTags('System')
@Controller('system')
@UseGuards(JwtAuthGuard)
export class SystemController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('state')
  @ApiOperation({ summary: '현재 시스템 주차 및 기간 상태 조회' })
  @ApiCommandResponse(200, '시스템 상태 조회 성공', SystemStateDto)
  async getSystemState(): Promise<ICommandResult<SystemStateDto>> {
    const command = new GetSystemStateCommand();
    return await this.commandBus.execute<SystemStateDto>(command);
  }
}
