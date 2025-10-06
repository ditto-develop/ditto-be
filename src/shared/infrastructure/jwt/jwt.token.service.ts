import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserCommand } from '../../../modules/auth/application/commands/login-user.command';
import { UserPayload } from '../../../common/typeguards/auth.type-guard';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  signToken(cmd: LoginUserCommand): string {
    const payload: UserPayload = {
      id: cmd.id.toString(),
    };
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): unknown {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new InternalServerErrorException('Invalid or expired token');
    }
  }
}
