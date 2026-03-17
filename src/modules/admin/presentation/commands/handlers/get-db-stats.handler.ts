import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetDbStatsCommand } from '../get-db-stats.command';
import { GetDbStatsUseCase } from '@module/admin/application/usecases/get-db-stats.usecase';
import { AdminDbStatsDto } from '@module/admin/application/dto/admin-db-stats.dto';

@Injectable()
@CommandHandler(GetDbStatsCommand)
export class GetDbStatsHandler implements ICommandHandler<GetDbStatsCommand, AdminDbStatsDto> {
  constructor(private readonly getDbStatsUseCase: GetDbStatsUseCase) {}

  async execute(_: GetDbStatsCommand): Promise<ICommandResult<AdminDbStatsDto>> {
    try {
      const data = await this.getDbStatsUseCase.execute();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
