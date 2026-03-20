import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { ICommandResult } from '@common/command/command.interface';
import { JwtAuthGuard } from '@module/user/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@module/user/infrastructure/guards/roles.guard';
import { Roles } from '@module/user/infrastructure/decorators/roles.decorator';
import { RoleCode } from '@module/role/domain/entities/role.entity';
import { AdminDbStatsDto } from '@module/admin/application/dto/admin-db-stats.dto';
import {
  AdminMatchListQueryDto,
  AdminMatchListResponseDto,
} from '@module/admin/application/dto/admin-match-list.dto';
import { AdminQuizProgressResponseDto } from '@module/admin/application/dto/admin-quiz-progress.dto';
import { AdminSeedDummyResultDto } from '@module/admin/application/dto/admin-seed-dummy.dto';
import { SetSystemOverrideDto } from '@module/admin/application/dto/set-system-override.dto';
import {
  AdminCreateDummyMatchRequestDto,
  AdminCreateDummyMatchResultDto,
  AdminActiveQuizSetDto,
} from '@module/admin/application/dto/admin-create-dummy-match-request.dto';
import { GetDbStatsCommand } from '../commands/get-db-stats.command';
import { GetAllMatchesCommand } from '../commands/get-all-matches.command';
import { SetSystemOverrideCommand } from '../commands/set-system-override.command';
import { ClearSystemOverrideCommand } from '../commands/clear-system-override.command';
import { ResetAllQuizProgressCommand } from '../commands/reset-all-quiz-progress.command';
import { GetAdminQuizProgressCommand } from '../commands/get-admin-quiz-progress.command';
import { SeedDummyDataCommand } from '../commands/seed-dummy-data.command';
import { GetAdminMatchCandidatesCommand } from '../commands/get-admin-match-candidates.command';
import { AdminCreateDummyMatchRequestCommand } from '../commands/admin-create-dummy-match-request.command';
import { AdminGetActiveQuizSetsCommand } from '../commands/admin-get-active-quiz-sets.command';
import { MatchCandidateListDto } from '@module/matching/application/dto/match-candidate.dto';

@ApiTags('Admin')
@Controller('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.ADMIN)
export class AdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('stats')
  @ApiOperation({ summary: 'DB 통계 조회' })
  @ApiCommandResponse(200, 'DB 통계 조회 성공', AdminDbStatsDto)
  async getDbStats(): Promise<ICommandResult<AdminDbStatsDto>> {
    return this.commandBus.execute<AdminDbStatsDto>(new GetDbStatsCommand());
  }

  @Get('matches')
  @ApiOperation({ summary: '전체 매칭 요청 목록 조회' })
  @ApiCommandResponse(200, '매칭 목록 조회 성공', AdminMatchListResponseDto)
  async getAllMatches(
    @Query() query: AdminMatchListQueryDto,
  ): Promise<ICommandResult<AdminMatchListResponseDto>> {
    return this.commandBus.execute<AdminMatchListResponseDto>(new GetAllMatchesCommand(query));
  }

  @Post('system/override')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '시스템 기간 오버라이드 설정' })
  @ApiCommandResponse(200, '오버라이드 설정 성공')
  async setSystemOverride(@Body() dto: SetSystemOverrideDto): Promise<ICommandResult<void>> {
    return this.commandBus.execute<void>(new SetSystemOverrideCommand(dto.period));
  }

  @Delete('system/override')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '시스템 기간 오버라이드 해제' })
  @ApiCommandResponse(200, '오버라이드 해제 성공')
  async clearSystemOverride(): Promise<ICommandResult<void>> {
    return this.commandBus.execute<void>(new ClearSystemOverrideCommand());
  }

  @Get('quiz-progress')
  @ApiOperation({ summary: '이번주 퀴즈 진행 현황 조회' })
  @ApiCommandResponse(200, '퀴즈 진행 현황 조회 성공', AdminQuizProgressResponseDto)
  async getQuizProgress(): Promise<ICommandResult<AdminQuizProgressResponseDto>> {
    return this.commandBus.execute<AdminQuizProgressResponseDto>(new GetAdminQuizProgressCommand());
  }

  @Post('quiz-progress/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '현재 주차 전체 퀴즈 진행 상황 초기화 (모든 사용자)' })
  @ApiCommandResponse(200, '퀴즈 초기화 성공')
  async resetAllQuizProgress(): Promise<ICommandResult<{ deletedAnswers: number; deletedProgress: number }>> {
    return this.commandBus.execute<{ deletedAnswers: number; deletedProgress: number }>(
      new ResetAllQuizProgressCommand(),
    );
  }

  @Post('seed-dummy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '더미 데이터 생성 (1:1 50명 + GROUP 50명)' })
  @ApiCommandResponse(200, '더미 데이터 생성 성공', AdminSeedDummyResultDto)
  async seedDummyData(): Promise<ICommandResult<AdminSeedDummyResultDto>> {
    return this.commandBus.execute<AdminSeedDummyResultDto>(new SeedDummyDataCommand());
  }

  @Get('users/:userId/match-candidates')
  @ApiOperation({ summary: '특정 사용자의 매칭 후보 조회 (관리자용)' })
  @ApiCommandResponse(200, '매칭 후보 조회 성공', MatchCandidateListDto)
  async getMatchCandidates(
    @Param('userId') userId: string,
  ): Promise<ICommandResult<MatchCandidateListDto>> {
    return this.commandBus.execute<MatchCandidateListDto>(new GetAdminMatchCandidatesCommand(userId));
  }

  @Get('quiz-sets/active')
  @ApiOperation({ summary: '현재 활성화된 퀴즈셋 목록 조회' })
  @ApiCommandResponse(200, '활성 퀴즈셋 조회 성공', AdminActiveQuizSetDto)
  async getActiveQuizSets(): Promise<ICommandResult<AdminActiveQuizSetDto[]>> {
    return this.commandBus.execute<AdminActiveQuizSetDto[]>(new AdminGetActiveQuizSetsCommand());
  }

  @Post('match-requests/dummy-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '더미 유저 → 실제 유저 대화 신청 생성 (관리자용)' })
  @ApiCommandResponse(200, '대화 신청 생성 성공', AdminCreateDummyMatchResultDto)
  async createDummyMatchRequest(
    @Body() dto: AdminCreateDummyMatchRequestDto,
  ): Promise<ICommandResult<AdminCreateDummyMatchResultDto>> {
    return this.commandBus.execute<AdminCreateDummyMatchResultDto>(
      new AdminCreateDummyMatchRequestCommand(dto),
    );
  }
}
