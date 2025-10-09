import { Body, Controller, HttpCode, HttpStatus, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateUserCommand } from '../application/commands/create-user.command';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../../common/typeguards/auth.type-guard';
import { LoginUserUseCase } from '../../auth/application/use-cases/login-user.use-case';
import { LoginUserCommand } from '../../auth/application/commands/login-user.command';
import { StartResponseDto } from './dto/start-response.dto';
import { CreateUserResponseDto } from './dto/create-user.dto';
import { RegisterEmailRequestDto, RegisterEmailResponseDto } from './dto/register-email.dto';
import { RegisterEmailCommand } from '../application/commands/register-email.command';
import { RegisterEmailUseCase } from '../application/use-cases/register-email.use-case';
import { SwaggerApiResponse } from '../../../common/decorators/swagger-api-response.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly registerEmailUseCase: RegisterEmailUseCase,
  ) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '무정보 가입 및 jwt 발급 API' })
  @ApiQuery({ name: 'referredBy', required: false, type: String, description: '추천 받은 코드 값' })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, type: StartResponseDto })
  @SwaggerApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  async start(@Query('referredBy') referredBy?: string): Promise<StartResponseDto> {
    const cmd = new CreateUserCommand(referredBy);
    const user = await this.createUserUseCase.execute(cmd);
    const loginUserCommand = new LoginUserCommand(user.id.toString());

    const userDto: CreateUserResponseDto = {
      id: user.id.toString(),
    };
    const { jwt } = this.loginUserUseCase.execute(loginUserCommand);
    return {
      user: userDto,
      jwt,
      referralLink: user.referralLink,
    };
  }

  @Patch('email')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '이메일 저장 API' })
  @ApiBearerAuth('access-token')
  @SwaggerApiResponse({ type: RegisterEmailResponseDto })
  @SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @SwaggerApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  async updateEmail(
    @CurrentUser() userPayload: UserPayload,
    @Body() dto: RegisterEmailRequestDto,
  ): Promise<RegisterEmailResponseDto> {
    const cmd = new RegisterEmailCommand(userPayload.id, dto.email);
    const user = await this.registerEmailUseCase.execute(cmd);

    return {
      id: user.id.toString(),
      email: user.getEmail(),
    };
  }
}
