import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { GetDbStatsCommand } from '../commands/get-db-stats.command';
import { GetAllMatchesCommand } from '../commands/get-all-matches.command';
import { SetSystemOverrideCommand } from '../commands/set-system-override.command';
import { ClearSystemOverrideCommand } from '../commands/clear-system-override.command';
import { ResetAllQuizProgressCommand } from '../commands/reset-all-quiz-progress.command';
import { GetAdminQuizProgressCommand } from '../commands/get-admin-quiz-progress.command';
import { SeedDummyDataCommand } from '../commands/seed-dummy-data.command';

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
  @ApiOperation({ summary: '더미 데이터 생성 (1:1 15명 + GROUP 15명)' })
  @ApiCommandResponse(200, '더미 데이터 생성 성공', AdminSeedDummyResultDto)
  async seedDummyData(): Promise<ICommandResult<AdminSeedDummyResultDto>> {
    return this.commandBus.execute<AdminSeedDummyResultDto>(new SeedDummyDataCommand());
  }
}
