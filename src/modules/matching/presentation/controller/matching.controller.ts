import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { ApiCommonErrorResponses, ApiNotFoundResponse } from '@common/command/api-error-response.decorator';
import { ICommandResult } from '@common/command/command.interface';
import { JwtAuthGuard } from '@module/user/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@module/user/infrastructure/decorators/current-user.decorator';
import { User } from '@module/user/domain/entities/user.entity';

import { MatchCandidateListDto } from '@module/matching/application/dto/match-candidate.dto';
import { SendMatchRequestDto, MatchRequestDto, MatchingStatusDto } from '@module/matching/application/dto/match-request.dto';
import { GetMatchCandidatesCommand } from '@module/matching/presentation/commands/get-match-candidates.command';
import { SendMatchRequestCommand } from '@module/matching/presentation/commands/send-match-request.command';
import { AcceptMatchRequestCommand } from '@module/matching/presentation/commands/accept-match-request.command';
import { RejectMatchRequestCommand } from '@module/matching/presentation/commands/reject-match-request.command';
import { GetMatchingStatusCommand } from '@module/matching/presentation/commands/get-matching-status.command';
import { JoinGroupCommand } from '@module/matching/presentation/commands/join-group.command';
import { GroupJoinResultDto } from '@module/matching/application/usecases/join-group.usecase';
import { DeclineGroupCommand } from '@module/matching/presentation/commands/decline-group.command';

@ApiTags('Matching')
@Controller()
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiCommonErrorResponses()
export class MatchingController {
    constructor(private readonly commandBus: CommandBus) { }

    @Get('matches/1on1')
    @ApiOperation({
        summary: '1:1 매칭 후보 조회',
        description: 'Hard filter(퀴즈 완료, 탈퇴 제외, 나이 선호 불일치 제외) + Score(퀴즈 일치율) 기반 최대 5명 반환',
    })
    @ApiCommandResponse(200, '매칭 후보 조회 성공', MatchCandidateListDto)
    async getMatchCandidates(@CurrentUser() user: User): Promise<ICommandResult<MatchCandidateListDto>> {
        const command = new GetMatchCandidatesCommand(user.id);
        return await this.commandBus.execute<MatchCandidateListDto>(command);
    }

    @Post('matches/request')
    @ApiOperation({ summary: '매칭 요청 보내기', description: '대상 사용자에게 1:1 대화 매칭 요청 전송' })
    @ApiCommandResponse(201, '매칭 요청 전송 성공', MatchRequestDto)
    async sendMatchRequest(
        @CurrentUser() user: User,
        @Body() dto: SendMatchRequestDto,
    ): Promise<ICommandResult<MatchRequestDto>> {
        const command = new SendMatchRequestCommand(user.id, dto);
        return await this.commandBus.execute<MatchRequestDto>(command);
    }

    @Post('matches/request/:id/accept')
    @ApiOperation({ summary: '매칭 요청 수락' })
    @ApiParam({ name: 'id', description: '매칭 요청 ID' })
    @ApiCommandResponse(200, '매칭 요청 수락 성공', MatchRequestDto)
    @ApiNotFoundResponse('매칭 요청을 찾을 수 없음')
    async acceptMatchRequest(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ): Promise<ICommandResult<MatchRequestDto>> {
        const command = new AcceptMatchRequestCommand(id, user.id);
        return await this.commandBus.execute<MatchRequestDto>(command);
    }

    @Post('matches/request/:id/reject')
    @ApiOperation({ summary: '매칭 요청 거절' })
    @ApiParam({ name: 'id', description: '매칭 요청 ID' })
    @ApiCommandResponse(200, '매칭 요청 거절 성공', MatchRequestDto)
    @ApiNotFoundResponse('매칭 요청을 찾을 수 없음')
    async rejectMatchRequest(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ): Promise<ICommandResult<MatchRequestDto>> {
        const command = new RejectMatchRequestCommand(id, user.id);
        return await this.commandBus.execute<MatchRequestDto>(command);
    }

    @Get('matching/status/:quizSetId')
    @ApiOperation({ summary: '매칭 상태 조회', description: '해당 퀴즈셋에서의 매칭 요청 현황' })
    @ApiParam({ name: 'quizSetId', description: '퀴즈셋 ID' })
    @ApiCommandResponse(200, '매칭 상태 조회 성공', MatchingStatusDto)
    async getMatchingStatus(
        @Param('quizSetId') quizSetId: string,
        @CurrentUser() user: User,
    ): Promise<ICommandResult<MatchingStatusDto>> {
        const command = new GetMatchingStatusCommand(user.id, quizSetId);
        return await this.commandBus.execute<MatchingStatusDto>(command);
    }

    @Post('matches/group/join')
    @ApiOperation({ summary: '그룹 매칭 참여', description: '현재 완료된 GROUP 퀴즈셋의 그룹 채팅방에 참여 신청' })
    @ApiCommandResponse(201, '그룹 참여 성공', GroupJoinResultDto)
    async joinGroup(@CurrentUser() user: User): Promise<ICommandResult<GroupJoinResultDto>> {
        const command = new JoinGroupCommand(user.id);
        return await this.commandBus.execute<GroupJoinResultDto>(command);
    }

    @Post('matches/group/decline')
    @ApiOperation({ summary: '그룹 매칭 거절', description: '이번 주 그룹 매칭 참여를 거절 (이번 주 내 복구 불가)' })
    @ApiCommandResponse(200, '그룹 거절 성공')
    async declineGroup(@CurrentUser() user: User): Promise<ICommandResult<void>> {
        const command = new DeclineGroupCommand(user.id);
        return await this.commandBus.execute<void>(command);
    }
}
