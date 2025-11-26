import { Global, Module } from '@nestjs/common';
import { CommandBus } from 'src/common/command/command-bus';

@Global()
@Module({
  providers: [CommandBus],
  exports: [CommandBus],
})
export class CommandBusModule {}
