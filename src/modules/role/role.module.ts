import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { GetAllRolesUseCase } from '@module/role/application/usecases/get-all-roles.usecase';
import { GetRoleByIdUseCase } from '@module/role/application/usecases/get-role-by-id.usecase';
import { RoleRepository } from '@module/role/infrastructure/repository/role.repository';
import { ROLE_REPOSITORY_TOKEN } from '@module/role/infrastructure/repository/role.repository.interface';
import { GetAllRolesHandler } from '@module/role/presentation/commands/handlers/get-all-roles.handler';
import { GetRoleByIdHandler } from '@module/role/presentation/commands/handlers/get-role-by-id.handler';
import { RoleController } from '@module/role/presentation/controller/role.controller';
import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { UserModule } from '@module/user/user.module';

const RoleRepositoryProvider = {
  provide: ROLE_REPOSITORY_TOKEN,
  useClass: RoleRepository,
};

@Module({
  imports: [CommandBusModule, forwardRef(() => UserModule)],
  controllers: [RoleController],
  providers: [
    // Repositories
    RoleRepositoryProvider,

    // UseCases
    GetAllRolesUseCase,
    GetRoleByIdUseCase,

    // Handlers
    GetAllRolesHandler,
    GetRoleByIdHandler,
  ],
  exports: [ROLE_REPOSITORY_TOKEN],
})
export class RoleModule implements OnModuleInit {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly getAllRolesHandler: GetAllRolesHandler,
    private readonly getRoleByIdHandler: GetRoleByIdHandler,
  ) {
    console.log('[RoleModule] RoleModule 초기화');
  }

  onModuleInit(): void {
    registerCommandHandlers(
      this.commandBus,
      [
        { handler: this.getAllRolesHandler, class: GetAllRolesHandler },
        { handler: this.getRoleByIdHandler, class: GetRoleByIdHandler },
      ],
      'RoleModule',
    );
  }
}
