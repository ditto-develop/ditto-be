import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from '../../../common/typeguards/auth.typeguard';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  signToken(payload: UserPayload): string {
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
