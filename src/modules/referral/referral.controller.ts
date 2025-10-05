import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';

@ApiTags('Referral')
@Controller()
export class ReferralController {
  @Get('r/:token')
  @ApiOperation({ summary: 'Referral landing' })
  landing(@Param('token') token: string) {
    // TODO:: 쿠기에 referred_by 저장 후 리다이렉트(프론트 라우트)
    // TODO:: 실제: res.cookie('referred_by', token, { httpOnly: false })
    return { redirectTo: '/?referred=1' };
  }

  @Post('referral/share')
  @ApiOperation({ summary: '공유 이벤트 기록' })
  share(@Body() body: { channel?: string }) {
    return { referral_link: 'http://example.com/r/ref_nanoid' };
  }
}
