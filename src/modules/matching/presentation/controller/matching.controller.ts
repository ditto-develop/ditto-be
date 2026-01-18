import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@common/command/command-bus';
import { JwtAuthGuard } from '@module/user/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@module/user/infrastructure/guards/roles.guard';
import { Roles } from '@module/user/infrastructure/decorators/roles.decorator';
import { RoleCode } from '@module/role/domain/entities/role.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetMatchingOpportunitiesCommand } from '../commands/get-matching-opportunities.command';
import { CreateMatchingRecordCommand } from '../commands/create-matching-record.command';
import { GetMatchingRecordsCommand } from '../commands/get-matching-records.command';
import { RetryMatchingAlgorithmCommand } from '../commands/retry-matching-algorithm.command';
import { MatchingRedisService } from '@module/matching/infrastructure/services/matching-redis.service';

class CreateMatchingRecordDto {
  matchedUserId: string;
  quizSetId: string;
}

@ApiTags('Matching')
@Controller('matching')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly matchingRedisService: MatchingRedisService,
  ) {}

  @Get('opportunities')
  @ApiOperation({
    summary: '매칭 기회 조회',
    description: '현재 주차의 매칭 기회를 조회합니다. 이전 주차의 매칭 기회는 조회되지 않습니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '매칭 기회 조회 성공',
  })
  async getMatchingOpportunities(
    @Request() req: any,
    @Query('quizSetId') quizSetId?: string,
  ) {
    const command = new GetMatchingOpportunitiesCommand(req.user.id, quizSetId);
    return await this.commandBus.execute(command);
  }

  @Post('records')
  @ApiOperation({
    summary: '매칭 선택 기록 생성',
    description: '매칭 상대를 선택합니다. 한 주차에 한 명만 선택할 수 있습니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '매칭 선택 성공',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '한 주차에 이미 선택했거나 유효하지 않은 요청',
  })
  async createMatchingRecord(
    @Request() req: any,
    @Body() dto: CreateMatchingRecordDto,
  ) {
    const command = new CreateMatchingRecordCommand(
      req.user.id,
      dto.matchedUserId,
      dto.quizSetId,
    );

    const result = await this.commandBus.execute(command);

    return {
      success: result.success,
      data: result.success ? {
        id: (result.data as any).id,
        userId: (result.data as any).userId,
        matchedUserId: (result.data as any).matchedUserId,
        quizSetId: (result.data as any).quizSetId,
        isMatched: (result.data as any).isMatched,
        matchedAt: (result.data as any).matchedAt,
      } : undefined,
      error: result.error,
    };
  }

  @Get('records')
  @ApiOperation({
    summary: '매칭 기록 조회',
    description: '현재 주차의 매칭 기록을 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '매칭 기록 조회 성공',
  })
  async getMatchingRecords(
    @Request() req: any,
    @Query('quizSetId') quizSetId?: string,
  ) {
    const command = new GetMatchingRecordsCommand(req.user.id, quizSetId);
    return await this.commandBus.execute(command);
  }

  @Get('status/:quizSetId')
  @ApiOperation({
    summary: '매칭 알고리즘 실행 상태 조회',
    description: '특정 퀴즈 세트의 매칭 알고리즘 실행 상태를 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '상태 조회 성공',
  })
  async getMatchingStatus(@Param('quizSetId') quizSetId: string) {
    const status = await this.matchingRedisService.getMatchingStatus(quizSetId);

    return {
      success: true,
      data: {
        status: status || 'pending',
        quizSetId,
        updatedAt: new Date(),
      },
    };
  }

  @Post('retry/:quizSetId')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @ApiOperation({
    summary: '매칭 알고리즘 수동 재실행 (관리자용)',
    description: '실패한 매칭 알고리즘을 수동으로 재실행합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '재실행 요청 성공',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '관리자 권한 필요',
  })
  async retryMatchingAlgorithm(@Param('quizSetId') quizSetId: string) {
    const command = new RetryMatchingAlgorithmCommand(quizSetId);
    const result = await this.commandBus.execute(command);

    return {
      success: result.success,
      data: result.success ? {
        message: '매칭 알고리즘 재실행이 큐에 추가되었습니다.',
        quizSetId,
      } : undefined,
      error: result.error,
    };
  }
}