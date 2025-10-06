import { Body, Controller, HttpCode, HttpStatus, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreateUserCommand } from '../application/commands/create-user.command';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async start(@Query('referredBy') referredBy?: string): Promise<StartResponseDto> {
    const cmd = new CreateUserCommand(referredBy);
    const user = await this.createUserUseCase.execute(cmd);
    return {
    };
  }
}
