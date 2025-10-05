import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Patch, Post, Req } from '@nestjs/common';
import { StartResponseDto } from './dto/start.dto';
import { EmailDto } from './dto/email.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { type UserPayload } from '../../common/typeguards/auth.typeguard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('start')
  @ApiOperation({ summary: '무정보 가입 및 jwt 발급' })
  @ApiResponse({ status: 201, type: StartResponseDto })
  start() {
    // TODO::실제: authService.createAnonymousUser(referredToken?)
    const user = { id: 'user_nanoid', email: null, referral_token: 'ref_nanoid' };
    const jwt = 'ey...';
    return {
      user,
      jwt,
      referral_link: `https://example.com/r/${user.referral_token}`,
    };
  }

  @Patch('email')
  @ApiOperation({ summary: '이메일 저장/업데이트' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Update ' })
  // @UseGuards(JwtAuthGuard)
  updateEmail(@Body() dto: EmailDto, @CurrentUser() user: UserPayload) {
    // const userId = req.user?.id || 'user_nanoid';
    return { ok: true, user: { id: user.id, email: dto.email } };
  }
}
