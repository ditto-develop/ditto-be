import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, UseGuards, Res, Req, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { ApiCommonErrorResponses, ApiNotFoundResponse, ApiNoContentResponse, ApiUnauthorizedResponse } from '@common/command/api-error-response.decorator';
import { ICommandResult } from '@common/command/command.interface';
import {
  UserDto,
  CreateAdminUserDto,
  CreateUserDto,
  UpdateUserDto,
  UserSocialAccountDto,
  LoginDto,
  SocialLoginDto,
  LoginResponseDto,
} from '@module/user/application/dto/user.dto';
import { CheckNicknameAvailabilityCommand } from '@module/user/presentation/commands/check-nickname-availability.command';
import { CreateAdminUserCommand } from '@module/user/presentation/commands/create-admin-user.command';
import { CreateUserCommand } from '@module/user/presentation/commands/create-user.command';
import { GetAllUsersCommand } from '@module/user/presentation/commands/get-all-users.command';
import { GetUserByIdCommand } from '@module/user/presentation/commands/get-user-by-id.command';
import { AddSocialAccountCommand } from '@module/user/presentation/commands/add-social-account.command';
import { DeleteUserCommand } from '@module/user/presentation/commands/delete-user.command';
import { GetMyProfileCommand } from '@module/user/presentation/commands/get-my-profile.command';
import { LeaveUserCommand } from '@module/user/presentation/commands/leave-user.command';
import { RemoveSocialAccountCommand } from '@module/user/presentation/commands/remove-social-account.command';
import { UpdateUserCommand } from '@module/user/presentation/commands/update-user.command';
import { LoginCommand } from '@module/user/presentation/commands/login.command';
import { LocalLoginCommand } from '@module/user/presentation/commands/local-login.command';
import { SocialLoginCommand } from '@module/user/presentation/commands/social-login.command';
import { RefreshAccessTokenCommand } from '@module/user/presentation/commands/refresh-access-token.command';
import { LogoutCommand } from '@module/user/presentation/commands/logout.command';
import { JwtAuthGuard } from '@module/user/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@module/user/infrastructure/guards/roles.guard';
import { Roles } from '@module/user/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '@module/user/infrastructure/decorators/current-user.decorator';
import { RoleCode } from '@module/role/domain/entities/role.entity';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  buildRefreshCookieOptions,
  buildRefreshCookieClearOptions,
} from '@module/user/infrastructure/utils/cookie.util';

@ApiTags('User')
@Controller('users')
@ApiCommonErrorResponses()
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {
    console.log('[UserController] UserController 초기화');
  }

  @Post('/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles(RoleCode.ADMIN, RoleCode.SUPER_ADMIN)
  @ApiOperation({ summary: '관리자 계정 생성', description: '관리자 계정을 생성합니다.' })
  @ApiCommandResponse(201, '관리자 계정 생성 성공', UserDto, false)
  async createAdmin(@Body() dto: CreateAdminUserDto): Promise<ICommandResult<UserDto>> {
    console.log('[UserController] 관리자 계정 생성 요청');
    const command = new CreateAdminUserCommand(dto);
    return await this.commandBus.execute<UserDto>(command);
  }

  @Post()
  @ApiOperation({ summary: '일반 사용자 계정 생성', description: '소셜 로그인을 통해 일반 사용자 계정을 생성합니다.' })
  @ApiCommandResponse(201, '사용자 계정 생성 성공', UserDto, false)
  async create(@Body() dto: CreateUserDto): Promise<ICommandResult<UserDto>> {
    console.log('[UserController] 일반 사용자 계정 생성 요청');
    const command = new CreateUserCommand(dto);
    return await this.commandBus.execute<UserDto>(command);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.SUPER_ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '모든 사용자 조회', description: '관리자가 모든 사용자를 조회합니다.' })
  @ApiCommandResponse(200, '사용자 목록 조회 성공', UserDto, true)
  async findAll(@CurrentUser() currentUser): Promise<ICommandResult<UserDto[]>> {
    console.log('[UserController] 모든 사용자 조회 요청');
    const command = new GetAllUsersCommand(currentUser.id);
    return await this.commandBus.execute<UserDto[]>(command);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles(RoleCode.ADMIN, RoleCode.SUPER_ADMIN, RoleCode.USER)
  @ApiOperation({ summary: '사용자 상세 조회', description: '특정 사용자의 상세 정보를 조회합니다.' })
  @ApiParam({ name: 'id', type: 'string', description: '사용자 ID' })
  @ApiCommandResponse(200, '사용자 조회 성공', UserDto, false)
  @ApiNotFoundResponse('사용자를 찾을 수 없음')
  async findById(@Param('id') id: string, @CurrentUser() currentUser): Promise<ICommandResult<UserDto>> {
    console.log(`[UserController] 사용자 조회 요청: id=${id}`);

    const command = new GetUserByIdCommand(id, currentUser.id);
    return await this.commandBus.execute<UserDto>(command);
  }

  @Get('/me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '본인 정보 조회', description: '현재 로그인한 사용자의 정보를 조회합니다.' })
  @ApiCommandResponse(200, '본인 정보 조회 성공', UserDto, false)
  async getMyProfile(@CurrentUser() user): Promise<ICommandResult<UserDto>> {
    console.log('[UserController] 본인 정보 조회 요청');
    const command = new GetMyProfileCommand(user.id);
    return await this.commandBus.execute<UserDto>(command);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles(RoleCode.ADMIN, RoleCode.SUPER_ADMIN, RoleCode.USER)
  @ApiOperation({ summary: '사용자 정보 수정', description: '사용자 정보를 수정합니다.' })
  @ApiParam({ name: 'id', type: 'string', description: '사용자 ID' })
  @ApiCommandResponse(200, '사용자 정보 수정 성공', UserDto, false)
  @ApiNotFoundResponse('사용자를 찾을 수 없음')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser,
  ): Promise<ICommandResult<UserDto>> {
    console.log(`[UserController] 사용자 정보 수정 요청: id=${id}`);

    const command = new UpdateUserCommand(id, dto, currentUser.id);
    return await this.commandBus.execute<UserDto>(command);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles(RoleCode.ADMIN, RoleCode.SUPER_ADMIN)
  @ApiOperation({ summary: '사용자 영구 삭제', description: '관리자가 사용자를 영구 삭제합니다.' })
  @ApiParam({ name: 'id', type: 'string', description: '사용자 ID' })
  @ApiNoContentResponse('사용자 삭제 성공')
  async delete(@Param('id') id: string, @CurrentUser() currentUser): Promise<ICommandResult<void>> {
    console.log(`[UserController] 사용자 삭제 요청: id=${id}`);
    const command = new DeleteUserCommand(id, currentUser.id);
    return await this.commandBus.execute<void>(command);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles(RoleCode.USER)
  @ApiOperation({ summary: '사용자 탈퇴', description: '사용자를 탈퇴 처리합니다.' })
  @ApiParam({ name: 'id', type: 'string', description: '사용자 ID' })
  @ApiCommandResponse(200, '사용자 탈퇴 처리 성공', UserDto, false)
  @ApiNotFoundResponse('사용자를 찾을 수 없음')
  async leave(@Param('id') id: string, @CurrentUser() currentUser): Promise<ICommandResult<UserDto>> {
    console.log(`[UserController] 사용자 탈퇴 요청: id=${id}`);

    const command = new LeaveUserCommand(id, currentUser.id);
    return await this.commandBus.execute<UserDto>(command);
  }

  @Post(':id/social-accounts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles(RoleCode.USER)
  @ApiOperation({ summary: '소셜 계정 추가', description: '사용자에게 소셜 계정을 추가합니다.' })
  @ApiParam({ name: 'id', type: 'string', description: '사용자 ID' })
  @ApiCommandResponse(201, '소셜 계정 추가 성공', UserSocialAccountDto, false)
  @ApiNotFoundResponse('사용자를 찾을 수 없음')
  async addSocialAccount(
    @Param('id') userId: string,
    @Body() dto: { provider: string; providerUserId: string },
    @CurrentUser() currentUser,
  ): Promise<ICommandResult<UserSocialAccountDto>> {
    console.log(`[UserController] 소셜 계정 추가 요청: userId=${userId}`);

    const command = new AddSocialAccountCommand(userId, dto, currentUser.id);
    return await this.commandBus.execute<UserSocialAccountDto>(command);
  }

  @Delete(':id/social-accounts/:provider')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles(RoleCode.USER)
  @ApiOperation({ summary: '소셜 계정 제거', description: '사용자의 소셜 계정을 제거합니다.' })
  @ApiParam({ name: 'id', type: 'string', description: '사용자 ID' })
  @ApiParam({ name: 'provider', type: 'string', description: '소셜 로그인 제공자' })
  @ApiNoContentResponse('소셜 계정 제거 성공')
  async removeSocialAccount(
    @Param('id') userId: string,
    @Param('provider') provider: string,
    @CurrentUser() currentUser,
  ): Promise<ICommandResult<void>> {
    console.log(`[UserController] 소셜 계정 제거 요청: userId=${userId}, provider=${provider}`);

    const command = new RemoveSocialAccountCommand(userId, provider, currentUser.id);
    return await this.commandBus.execute<void>(command);
  }

  @Post('/login')
  @ApiOperation({ summary: '관리자 로그인', description: '관리자 계정으로 로그인합니다.' })
  @ApiCommandResponse(200, '로그인 성공', LoginResponseDto, false)
  @ApiUnauthorizedResponse('인증 실패')
  async login(
    @Body() dto: LoginDto,
  ): Promise<ICommandResult<LoginResponseDto>> {
    console.log('[UserController] 관리자 로그인 요청');
    const command = new LoginCommand(dto);
    const result = await this.commandBus.execute<LoginResponseDto>(command);

    // 어드민 로그인은 refreshToken 쿠키를 세팅하지 않음
    // (일반 유저의 refreshToken 쿠키를 덮어쓰는 문제 방지)
    if (result.success && result.data?.refreshToken) {
      delete result.data.refreshToken;
    }

    return result;
  }

  @Post('/local-login')
  @ApiOperation({ summary: '로컬 테스트 로그인 (개발 환경 전용)', description: 'localhost 개발 환경에서만 사용 가능한 username/password 로그인입니다.' })
  @ApiCommandResponse(200, '로그인 성공', LoginResponseDto, false)
  @ApiUnauthorizedResponse('인증 실패')
  async localLogin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ICommandResult<LoginResponseDto>> {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('로컬 로그인은 개발 환경에서만 사용 가능합니다.');
    }

    const command = new LocalLoginCommand(dto);
    const result = await this.commandBus.execute<LoginResponseDto>(command);

    if (result.success && result.data?.refreshToken) {
      res.cookie('refreshToken', result.data.refreshToken, buildRefreshCookieOptions(this.configService));
      delete result.data.refreshToken;
    }

    return result;
  }

  @Post('/social-login')
  @ApiOperation({ summary: '소셜 로그인', description: '소셜 계정으로 로그인합니다.' })
  @ApiCommandResponse(200, '로그인 성공', LoginResponseDto, false)
  @ApiUnauthorizedResponse('인증 실패')
  async socialLogin(
    @Body() dto: SocialLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ICommandResult<LoginResponseDto>> {
    console.log('[UserController] 소셜 로그인 요청');
    const command = new SocialLoginCommand(dto);
    const result = await this.commandBus.execute<LoginResponseDto>(command);

    if (result.success && result.data?.refreshToken) {
      res.cookie('refreshToken', result.data.refreshToken, buildRefreshCookieOptions(this.configService));
      delete result.data.refreshToken;
    }

    return result;
  }

  @HttpCode(200)
  @Post('/auth/refresh')
  @ApiOperation({ summary: '토큰 재발급', description: '리프레시 토큰으로 새로운 액세스/리프레시 토큰을 발급합니다.' })
  @ApiCommandResponse(200, '토큰 재발급 성공', LoginResponseDto, false)
  @ApiUnauthorizedResponse('리프레시 토큰 검증 실패')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ICommandResult<LoginResponseDto>> {
    const refreshToken = req.cookies?.refreshToken;
    const command = new RefreshAccessTokenCommand(refreshToken);
    const result = await this.commandBus.execute<LoginResponseDto>(command);

    if (result.success && result.data?.refreshToken) {
      res.cookie('refreshToken', result.data.refreshToken, buildRefreshCookieOptions(this.configService));
      delete result.data.refreshToken;
    }

    return result;
  }

  @Post('/auth/logout')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '로그아웃', description: '리프레시 토큰을 폐기하고 쿠키를 제거합니다.' })
  @ApiCommandResponse(200, '로그아웃 성공')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<ICommandResult<void>> {
    const refreshToken = req.cookies?.refreshToken;
    const command = new LogoutCommand(refreshToken);
    const result = await this.commandBus.execute<void>(command);

    if (result.success) {
      res.clearCookie('refreshToken', buildRefreshCookieClearOptions(this.configService));
    }

    return result;
  }

  @Get('/nickname/:nickname/availability')
  @ApiOperation({ summary: '닉네임 사용 가능 여부 확인', description: '닉네임이 사용 가능한지 확인합니다.' })
  @ApiParam({ name: 'nickname', type: 'string', description: '확인할 닉네임' })
  @ApiCommandResponse(200, '닉네임 사용 가능 여부 확인 성공', Object, false)
  async checkNicknameAvailability(@Param('nickname') nickname: string): Promise<ICommandResult<{ available: boolean }>> {
    console.log(`[UserController] 닉네임 사용 가능 여부 확인 요청: nickname=${nickname}`);
    const command = new CheckNicknameAvailabilityCommand(nickname);
    return await this.commandBus.execute<{ available: boolean }>(command);
  }
}
