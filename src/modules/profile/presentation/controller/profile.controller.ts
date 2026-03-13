import { Body, Controller, Get, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@common/command/command-bus';
import { ApiCommandResponse } from '@common/command/api-response.decorator';
import { ApiCommonErrorResponses, ApiNotFoundResponse } from '@common/command/api-error-response.decorator';
import { ICommandResult } from '@common/command/command.interface';
import { JwtAuthGuard } from '@module/user/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@module/user/infrastructure/decorators/current-user.decorator';
import { User } from '@module/user/domain/entities/user.entity';

import { UserProfileDto } from '@module/profile/application/dto/user-profile.dto';
import { UpdateProfileDto } from '@module/profile/application/dto/update-profile.dto';
import { PublicProfileDto } from '@module/profile/application/dto/public-profile.dto';
import { IntroNotesDto, UpdateIntroNotesDto } from '@module/profile/application/dto/intro-notes.dto';
import { GetMyProfileCommand } from '@module/profile/presentation/commands/get-my-profile.command';
import { UpdateMyProfileCommand } from '@module/profile/presentation/commands/update-my-profile.command';
import { GetUserProfileCommand } from '@module/profile/presentation/commands/get-user-profile.command';
import { GetIntroNotesCommand } from '@module/profile/presentation/commands/get-intro-notes.command';
import { UpdateIntroNotesCommand } from '@module/profile/presentation/commands/update-intro-notes.command';

@ApiTags('Profile')
@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiCommonErrorResponses()
export class ProfileController {
    constructor(private readonly commandBus: CommandBus) {
        console.log('[ProfileController] 초기화');
    }

    @Get('me/profile')
    @ApiOperation({ summary: '내 프로필 조회', description: '본인의 프로필(자기소개, 매칭 선호 조건)을 조회합니다.' })
    @ApiCommandResponse(200, '프로필 조회 성공', UserProfileDto)
    async getMyProfile(@CurrentUser() user: User): Promise<ICommandResult<UserProfileDto>> {
        console.log(`[ProfileController] 내 프로필 조회: userId=${user.id}`);
        const command = new GetMyProfileCommand(user.id);
        return await this.commandBus.execute<UserProfileDto>(command);
    }

    @Patch('me/profile')
    @ApiOperation({
        summary: '내 프로필 수정',
        description: '자기소개(최대 300자), 매칭 선호 나이를 수정합니다. null을 전송하면 해당 필드가 초기화됩니다.',
    })
    @ApiCommandResponse(200, '프로필 수정 성공', UserProfileDto)
    async updateMyProfile(
        @CurrentUser() user: User,
        @Body() dto: UpdateProfileDto,
    ): Promise<ICommandResult<UserProfileDto>> {
        console.log(`[ProfileController] 프로필 수정: userId=${user.id}`);
        const command = new UpdateMyProfileCommand(user.id, dto);
        return await this.commandBus.execute<UserProfileDto>(command);
    }

    @Get('me/intro-notes')
    @ApiOperation({ summary: '내 소개 노트 조회', description: '10개 답변 배열과 작성 완료 수를 반환합니다. 미작성 시 빈 문자열 배열을 반환합니다.' })
    @ApiCommandResponse(200, '소개 노트 조회 성공', IntroNotesDto)
    async getIntroNotes(@CurrentUser() user: User): Promise<ICommandResult<IntroNotesDto>> {
        const command = new GetIntroNotesCommand(user.id);
        return await this.commandBus.execute<IntroNotesDto>(command);
    }

    @Put('me/intro-notes')
    @ApiOperation({ summary: '내 소개 노트 저장/수정', description: '10개 답변 배열을 저장합니다. 빈 문자열로 부분 저장 가능합니다.' })
    @ApiCommandResponse(200, '소개 노트 저장 성공', IntroNotesDto)
    async updateIntroNotes(
        @CurrentUser() user: User,
        @Body() dto: UpdateIntroNotesDto,
    ): Promise<ICommandResult<IntroNotesDto>> {
        const command = new UpdateIntroNotesCommand(user.id, dto);
        return await this.commandBus.execute<IntroNotesDto>(command);
    }

    @Get(':id/intro-notes')
    @ApiOperation({ summary: '타인 소개 노트 조회', description: '다른 사용자의 소개 노트 답변을 조회합니다.' })
    @ApiParam({ name: 'id', description: '대상 사용자 ID' })
    @ApiCommandResponse(200, '소개 노트 조회 성공', IntroNotesDto)
    async getUserIntroNotes(@Param('id') id: string): Promise<ICommandResult<IntroNotesDto>> {
        const command = new GetIntroNotesCommand(id);
        return await this.commandBus.execute<IntroNotesDto>(command);
    }

    @Get(':id/profile')
    @ApiOperation({
        summary: '타인 프로필 조회',
        description: '다른 사용자의 공개 프로필을 조회합니다. 민감 정보(이메일, 전화번호)는 포함되지 않습니다.',
    })
    @ApiParam({ name: 'id', description: '대상 사용자 ID' })
    @ApiCommandResponse(200, '프로필 조회 성공', PublicProfileDto)
    @ApiNotFoundResponse('사용자를 찾을 수 없음')
    async getUserProfile(@Param('id') id: string): Promise<ICommandResult<PublicProfileDto>> {
        console.log(`[ProfileController] 타인 프로필 조회: targetUserId=${id}`);
        const command = new GetUserProfileCommand(id);
        return await this.commandBus.execute<PublicProfileDto>(command);
    }
}
