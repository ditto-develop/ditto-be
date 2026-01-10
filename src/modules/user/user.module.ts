import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { CommandBus } from '@common/command/command-bus';
import { CommandBusModule } from '@common/command/command-bus.module';
import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
import { RoleModule } from '@module/role/role.module';
import { UserRepository } from '@module/user/infrastructure/repository/user.repository';
import { USER_REPOSITORY_TOKEN } from '@module/user/infrastructure/repository/user.repository.interface';
import { UserSocialAccountRepository } from '@module/user/infrastructure/repository/user-social-account.repository';
import { USER_SOCIAL_ACCOUNT_REPOSITORY_TOKEN } from '@module/user/infrastructure/repository/user-social-account.repository.interface';
import { UserController } from '@module/user/presentation/controller/user.controller';
import { AddSocialAccountUseCase } from '@module/user/application/usecases/add-social-account.usecase';
import { CheckNicknameAvailabilityUseCase } from '@module/user/application/usecases/check-nickname-availability.usecase';
import { CreateAdminUserUseCase } from '@module/user/application/usecases/create-admin-user.usecase';
import { CreateUserUseCase } from '@module/user/application/usecases/create-user.usecase';
import { DeleteUserUseCase } from '@module/user/application/usecases/delete-user.usecase';
import { GetAllUsersUseCase } from '@module/user/application/usecases/get-all-users.usecase';
import { GetMyProfileUseCase } from '@module/user/application/usecases/get-my-profile.usecase';
import { GetUserByIdUseCase } from '@module/user/application/usecases/get-user-by-id.usecase';
import { LeaveUserUseCase } from '@module/user/application/usecases/leave-user.usecase';
import { RemoveSocialAccountUseCase } from '@module/user/application/usecases/remove-social-account.usecase';
import { UpdateUserUseCase } from '@module/user/application/usecases/update-user.usecase';
import { RefreshAccessTokenUseCase } from '@module/user/application/usecases/refresh-access-token.usecase';
import { LogoutUseCase } from '@module/user/application/usecases/logout.usecase';
import { AddSocialAccountHandler } from '@module/user/presentation/commands/handlers/add-social-account.handler';
import { CheckNicknameAvailabilityHandler } from '@module/user/presentation/commands/handlers/check-nickname-availability.handler';
import { CreateAdminUserHandler } from '@module/user/presentation/commands/handlers/create-admin-user.handler';
import { CreateUserHandler } from '@module/user/presentation/commands/handlers/create-user.handler';
import { DeleteUserHandler } from '@module/user/presentation/commands/handlers/delete-user.handler';
import { GetAllUsersHandler } from '@module/user/presentation/commands/handlers/get-all-users.handler';
import { GetMyProfileHandler } from '@module/user/presentation/commands/handlers/get-my-profile.handler';
import { GetUserByIdHandler } from '@module/user/presentation/commands/handlers/get-user-by-id.handler';
import { LeaveUserHandler } from '@module/user/presentation/commands/handlers/leave-user.handler';
import { RemoveSocialAccountHandler } from '@module/user/presentation/commands/handlers/remove-social-account.handler';
import { UpdateUserHandler } from '@module/user/presentation/commands/handlers/update-user.handler';
import { LoginHandler } from '@module/user/presentation/commands/handlers/login.handler';
import { SocialLoginHandler } from '@module/user/presentation/commands/handlers/social-login.handler';
import { RefreshAccessTokenHandler } from '@module/user/presentation/commands/handlers/refresh-access-token.handler';
import { LogoutHandler } from '@module/user/presentation/commands/handlers/logout.handler';
import { AuthService } from '@module/user/application/services/auth.service';
import { LoginUseCase } from '@module/user/application/usecases/login.usecase';
import { RefreshTokenService } from '@module/user/application/services/refresh-token.service';

const UserRepositoryProvider = {
  provide: USER_REPOSITORY_TOKEN,
  useClass: UserRepository,
};

const UserSocialAccountRepositoryProvider = {
  provide: USER_SOCIAL_ACCOUNT_REPOSITORY_TOKEN,
  useClass: UserSocialAccountRepository,
};

@Module({
  imports: [
    CommandBusModule,
    forwardRef(() => RoleModule),
  ],
  controllers: [UserController],
  providers: [
    // Repositories
    UserRepositoryProvider,
    UserSocialAccountRepositoryProvider,

    // Services
    AuthService,
    RefreshTokenService,

    // UseCases
    CheckNicknameAvailabilityUseCase,
    CreateAdminUserUseCase,
    CreateUserUseCase,
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    GetMyProfileUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    LeaveUserUseCase,
    AddSocialAccountUseCase,
    RemoveSocialAccountUseCase,
    LoginUseCase,
    RefreshAccessTokenUseCase,
    LogoutUseCase,

    // Handlers
    CheckNicknameAvailabilityHandler,
    CreateAdminUserHandler,
    CreateUserHandler,
    GetAllUsersHandler,
    GetUserByIdHandler,
    GetMyProfileHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    LeaveUserHandler,
    AddSocialAccountHandler,
    RemoveSocialAccountHandler,
    LoginHandler,
    SocialLoginHandler,
    RefreshAccessTokenHandler,
    LogoutHandler,
  ],
  exports: [USER_REPOSITORY_TOKEN, USER_SOCIAL_ACCOUNT_REPOSITORY_TOKEN],
})
export class UserModule implements OnModuleInit {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly checkNicknameAvailabilityHandler: CheckNicknameAvailabilityHandler,
    private readonly createAdminUserHandler: CreateAdminUserHandler,
    private readonly createUserHandler: CreateUserHandler,
    private readonly getAllUsersHandler: GetAllUsersHandler,
    private readonly getUserByIdHandler: GetUserByIdHandler,
    private readonly getMyProfileHandler: GetMyProfileHandler,
    private readonly updateUserHandler: UpdateUserHandler,
    private readonly deleteUserHandler: DeleteUserHandler,
    private readonly leaveUserHandler: LeaveUserHandler,
    private readonly addSocialAccountHandler: AddSocialAccountHandler,
    private readonly removeSocialAccountHandler: RemoveSocialAccountHandler,
    private readonly loginHandler: LoginHandler,
    private readonly socialLoginHandler: SocialLoginHandler,
    private readonly refreshAccessTokenHandler: RefreshAccessTokenHandler,
    private readonly logoutHandler: LogoutHandler,
  ) {
    console.log('[UserModule] UserModule 초기화');
  }

  onModuleInit(): void {
    registerCommandHandlers(
      this.commandBus,
      [
        { handler: this.checkNicknameAvailabilityHandler, class: CheckNicknameAvailabilityHandler },
        { handler: this.createAdminUserHandler, class: CreateAdminUserHandler },
        { handler: this.createUserHandler, class: CreateUserHandler },
        { handler: this.getAllUsersHandler, class: GetAllUsersHandler },
        { handler: this.getUserByIdHandler, class: GetUserByIdHandler },
        { handler: this.getMyProfileHandler, class: GetMyProfileHandler },
        { handler: this.updateUserHandler, class: UpdateUserHandler },
        { handler: this.deleteUserHandler, class: DeleteUserHandler },
        { handler: this.leaveUserHandler, class: LeaveUserHandler },
        { handler: this.addSocialAccountHandler, class: AddSocialAccountHandler },
        { handler: this.removeSocialAccountHandler, class: RemoveSocialAccountHandler },
        { handler: this.loginHandler, class: LoginHandler },
        { handler: this.socialLoginHandler, class: SocialLoginHandler },
        { handler: this.refreshAccessTokenHandler, class: RefreshAccessTokenHandler },
        { handler: this.logoutHandler, class: LogoutHandler },
      ],
      'UserModule',
    );
  }
}
