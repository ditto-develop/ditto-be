import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtTokenService } from '../../shared/infrastructure/jwt/jwt.token.service';
import { isUserPayload, UserPayload } from '../typeguards/auth.type-guard';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: UserPayload }>();
    const auth = req.headers['authorization'];
    if (!auth) throw new UnauthorizedException('Authorization header missing');

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') throw new UnauthorizedException();
    const token = parts[1];
    const decoded = this.jwtTokenService.verifyToken(token);
    if (!isUserPayload(decoded)) throw new UnauthorizedException('Invalid token payload');

    req.user = decoded;
    return true;
  }
}
