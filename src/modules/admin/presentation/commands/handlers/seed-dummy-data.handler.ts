import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { SeedDummyDataUseCase } from '@module/admin/application/usecases/seed-dummy-data.usecase';
import { AdminSeedDummyResultDto } from '@module/admin/application/dto/admin-seed-dummy.dto';
import { SeedDummyDataCommand } from '../seed-dummy-data.command';

@Injectable()
@CommandHandler(SeedDummyDataCommand)
export class SeedDummyDataHandler implements ICommandHandler<SeedDummyDataCommand> {
  constructor(private readonly useCase: SeedDummyDataUseCase) {}

  async execute(_command: SeedDummyDataCommand): Promise<ICommandResult<AdminSeedDummyResultDto>> {
    const data = await this.useCase.execute();
    return { success: true, data };
  }
}
