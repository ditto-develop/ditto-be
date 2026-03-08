import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { ApiCommonErrorResponses } from '@common/command/api-error-response.decorator';
import { ICommandResult } from '@common/command/command.interface';
import { JwtAuthGuard } from '@module/user/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@module/user/infrastructure/decorators/current-user.decorator';
import { User } from '@module/user/domain/entities/user.entity';

import { UserAnswersComparisonDto } from '@module/rating/application/dto/answer-comparison.dto';
import { CreateRatingDto, RatingItemDto, UserRatingSummaryDto } from '@module/rating/application/dto/rating.dto';
import { GetUserAnswersCommand } from '@module/rating/presentation/commands/get-user-answers.command';
import { CreateRatingCommand } from '@module/rating/presentation/commands/create-rating.command';
import { GetUserRatingsCommand } from '@module/rating/presentation/commands/get-user-ratings.command';

@ApiTags('Profile Detail')
@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiCommonErrorResponses()
export class RatingController {
    constructor(private readonly commandBus: CommandBus) { }

    @Get(':id/answers')
    @ApiOperation({
        summary: '상대 답변 비교 조회',
        description: '매칭 성사된 상대와의 퀴즈 답변을 비교합니다. 퀴즈별 일치 여부와 전체 일치율을 반환합니다.',
    })
    @ApiParam({ name: 'id', description: '대상 사용자 ID' })
    @ApiCommandResponse(200, '답변 비교 조회 성공', UserAnswersComparisonDto)
    async getUserAnswers(
        @Param('id') targetUserId: string,
        @CurrentUser() user: User,
    ): Promise<ICommandResult<UserAnswersComparisonDto>> {
        const command = new GetUserAnswersCommand(user.id, targetUserId);
        return await this.commandBus.execute<UserAnswersComparisonDto>(command);
    }

    @Get(':id/ratings')
    @ApiOperation({
        summary: '사용자 평가 조회',
        description: '누적 평가 3개 이상 시 평균 점수와 개별 평가를 공개합니다. 미달 시 총 평가 수만 반환합니다.',
    })
    @ApiParam({ name: 'id', description: '대상 사용자 ID' })
    @ApiCommandResponse(200, '평가 조회 성공', UserRatingSummaryDto)
    async getUserRatings(
        @Param('id') targetUserId: string,
    ): Promise<ICommandResult<UserRatingSummaryDto>> {
        const command = new GetUserRatingsCommand(targetUserId);
        return await this.commandBus.execute<UserRatingSummaryDto>(command);
    }

    @Post(':id/ratings')
    @ApiOperation({
        summary: '사용자 평가 작성',
        description: '매칭 성사된 상대에 대한 평가를 작성합니다. 같은 매칭 건에 대해 중복 평가는 불가합니다.',
    })
    @ApiParam({ name: 'id', description: '대상 사용자 ID' })
    @ApiCommandResponse(201, '평가 작성 성공', RatingItemDto)
    async createRating(
        @Param('id') targetUserId: string,
        @CurrentUser() user: User,
        @Body() dto: CreateRatingDto,
    ): Promise<ICommandResult<RatingItemDto>> {
        const command = new CreateRatingCommand(user.id, targetUserId, dto);
        return await this.commandBus.execute<RatingItemDto>(command);
    }
}
