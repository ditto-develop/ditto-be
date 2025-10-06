import { Injectable } from '@nestjs/common';
import { JwtTokenService } from '../../../../shared/infrastructure/jwt/jwt.token.service';
import { LoginUserCommand } from '../commands/login-user.command';

@Injectable()
export class LoginUserUseCase {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  execute(cmd: LoginUserCommand): {
    jwt: string;
  } {
    const jwt = this.jwtTokenService.signToken(cmd);
    return { jwt };
  }
}
