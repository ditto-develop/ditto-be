import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { ICommandResult } from '@common/command/command.interface';
import {
  UserDto,
  CreateAdminUserDto,
  CreateUserDto,
  UpdateUserDto,
  UserSocialAccountDto,
} from '@module/user/application/dto/user.dto';
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

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly commandBus: CommandBus) {
    console.log('[UserController] UserController 초기화');
  }

  @Post('/admin')
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
  @ApiOperation({ summary: '모든 사용자 조회', description: '관리자가 모든 사용자를 조회합니다.' })
  @ApiCommandResponse(200, '사용자 목록 조회 성공', UserDto, true)
  async findAll(): Promise<ICommandResult<UserDto[]>> {
    console.log('[UserController] 모든 사용자 조회 요청');
    // TODO: 권한 체크 (관리자만 가능)
    const command = new GetAllUsersCommand();
    return await this.commandBus.execute<UserDto[]>(command);
  }

  @Get(':id')
  @ApiOperation({ summary: '사용자 상세 조회', description: '특정 사용자의 상세 정보를 조회합니다.' })
  @ApiParam({ name: 'id', type: 'string', description: '사용자 ID' })
  @ApiCommandResponse(200, '사용자 조회 성공', UserDto, false)
  @ApiCommandResponse(404, '사용자를 찾을 수 없음')
  async findById(@Param('id') id: string): Promise<ICommandResult<UserDto>> {
    console.log(`[UserController] 사용자 조회 요청: id=${id}`);
    // TODO: 권한 체크 (관리자 또는 본인만 가능)
    const command = new GetUserByIdCommand(id);
    return await this.commandBus.execute<UserDto>(command);
  }

  @Get('/me/profile')
  @ApiOperation({ summary: '본인 정보 조회', description: '현재 로그인한 사용자의 정보를 조회합니다.' })
  @ApiCommandResponse(200, '본인 정보 조회 성공', UserDto, false)
  async getMyProfile(): Promise<ICommandResult<UserDto>> {
    console.log('[UserController] 본인 정보 조회 요청');
    // TODO: 현재 사용자 ID 가져오기
    const currentUserId = 'temp-user-id'; // 임시
    const command = new GetMyProfileCommand(currentUserId);
    return await this.commandBus.execute<UserDto>(command);
  }

  @Patch(':id')
  @ApiOperation({ summary: '사용자 정보 수정', description: '사용자 정보를 수정합니다.' })
  @ApiParam({ name: 'id', type: 'string', description: '사용자 ID' })
  @ApiCommandResponse(200, '사용자 정보 수정 성공', UserDto, false)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<ICommandResult<UserDto>> {
    console.log(`[UserController] 사용자 정보 수정 요청: id=${id}`);
    // TODO: 현재 사용자 ID 가져오기
    const currentUserId = 'temp-user-id'; // 임시
    const command = new UpdateUserCommand(id, dto, currentUserId);
    return await this.commandBus.execute<UserDto>(command);
  }

  @Delete(':id')
  @ApiOperation({ summary: '사용자 영구 삭제', description: '관리자가 사용자를 영구 삭제합니다.' })
  @ApiParam({ name: 'id', type: 'string', description: '사용자 ID' })
  @ApiCommandResponse(200, '사용자 삭제 성공')
  async delete(@Param('id') id: string): Promise<ICommandResult<void>> {
    console.log(`[UserController] 사용자 삭제 요청: id=${id}`);
    // TODO: 현재 사용자 ID 가져오기
    const currentUserId = 'temp-admin-id'; // 임시
    const command = new DeleteUserCommand(id, currentUserId);
    return await this.commandBus.execute<void>(command);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: '사용자 탈퇴', description: '사용자를 탈퇴 처리합니다.' })
  @ApiParam({ name: 'id', type: 'string', description: '사용자 ID' })
  @ApiCommandResponse(200, '사용자 탈퇴 처리 성공', UserDto, false)
  async leave(@Param('id') id: string): Promise<ICommandResult<UserDto>> {
    console.log(`[UserController] 사용자 탈퇴 요청: id=${id}`);
    // TODO: 현재 사용자 ID 가져오기
    const currentUserId = id; // 임시 (본인 탈퇴 가정)
    const command = new LeaveUserCommand(id, currentUserId);
    return await this.commandBus.execute<UserDto>(command);
  }

  @Post(':id/social-accounts')
  @ApiOperation({ summary: '소셜 계정 추가', description: '사용자에게 소셜 계정을 추가합니다.' })
  @ApiParam({ name: 'id', type: 'string', description: '사용자 ID' })
  @ApiCommandResponse(201, '소셜 계정 추가 성공', UserSocialAccountDto, false)
  async addSocialAccount(
    @Param('id') userId: string,
    @Body() dto: { provider: string; providerUserId: string },
  ): Promise<ICommandResult<UserSocialAccountDto>> {
    console.log(`[UserController] 소셜 계정 추가 요청: userId=${userId}`);
    // TODO: 현재 사용자 ID 가져오기
    const currentUserId = userId; // 임시 (본인 계정 가정)
    const command = new AddSocialAccountCommand(userId, dto, currentUserId);
    return await this.commandBus.execute<UserSocialAccountDto>(command);
  }

  @Delete(':id/social-accounts/:provider')
  @ApiOperation({ summary: '소셜 계정 제거', description: '사용자의 소셜 계정을 제거합니다.' })
  @ApiParam({ name: 'id', type: 'string', description: '사용자 ID' })
  @ApiParam({ name: 'provider', type: 'string', description: '소셜 로그인 제공자' })
  @ApiCommandResponse(200, '소셜 계정 제거 성공')
  async removeSocialAccount(
    @Param('id') userId: string,
    @Param('provider') provider: string,
  ): Promise<ICommandResult<void>> {
    console.log(`[UserController] 소셜 계정 제거 요청: userId=${userId}, provider=${provider}`);
    // TODO: 현재 사용자 ID 가져오기
    const currentUserId = userId; // 임시 (본인 계정 가정)
    const command = new RemoveSocialAccountCommand(userId, provider, currentUserId);
    return await this.commandBus.execute<void>(command);
  }
}
