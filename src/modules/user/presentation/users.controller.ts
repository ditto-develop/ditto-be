import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';
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
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { UploadInterceptor } from '../../../common/interceptors/upload.interceptor';
import { UploadedFileVo } from '../../../common/value-objects/uploaded-file.vo';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadGameResultImageCommand } from '../application/commands/upload-game-result-image.command';
import { UploadGameResultImageUseCase } from '../application/use-cases/upload-game-result-image.use-case';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '무정보 가입 및 jwt 발급 API' })
  @ApiQuery({ name: 'referredBy', required: false, type: String, description: '추천 받은 코드 값' })
  @SwaggerApiResponse({ status: HttpStatus.CREATED, type: StartResponseDto })
  @SwaggerApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  async start(
    @Res({ passthrough: true }) res: Response,
    @Query('referredBy') referredBy?: string,
  ): Promise<StartResponseDto> {
    const cmd = new CreateUserCommand(referredBy);
    const user = await this.createUserUseCase.execute(cmd);
    const loginUserCommand = new LoginUserCommand(user.id.toString());

    const userDto: CreateUserResponseDto = {
      id: user.id.toString(),
    };
    const { jwt } = this.loginUserUseCase.execute(loginUserCommand);

    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    res.cookie('access_token', jwt, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });

    return {
      user: userDto,
      referralLink: user.referralLink,
    };
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly registerEmailUseCase: RegisterEmailUseCase,
    private readonly uploadGameResultImageUseCase: UploadGameResultImageUseCase,
  ) {}

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

  @Patch(':round/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    new UploadInterceptor({
      fieldName: 'file',
      dest: join(process.cwd(), 'public', 'images'),
      allowedMimeTypes: ['image/png', 'image/jpeg'],
    }),
  )
  @ApiOperation({ summary: '라운드별 결과 등록 API' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @SwaggerApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @SwaggerApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  async uploadGameResultImage(
    @Param('round', ParseIntPipe) round: number,
    @CurrentUser() user: UserPayload,
    @UploadedFile() uploadedFile: Express.Multer.File,
  ): Promise<{
    url: string;
  }> {
    if (!uploadedFile) throw new Error('No file uploaded');

    const vo = UploadedFileVo.fromMulterFile(uploadedFile);
    const cmd = new UploadGameResultImageCommand(user.id, round, vo);
    await this.uploadGameResultImageUseCase.execute(cmd);

    return {
      url: vo.url,
    };
  }
}
