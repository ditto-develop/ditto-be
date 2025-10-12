import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtTokenService } from '../../shared/infrastructure/jwt/jwt.token.service';
import { hasAccessTokenInCookies, hasCookies, isUserPayload, UserPayload } from '../typeguards/auth.type-guard';
import { Request } from 'express';
import { isRecord, isString } from '../typeguards/common.type-guard';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: UserPayload }>();

    const token = this.getJwtTokenFromCookie(req) ?? this.getJwtTokenFromAuthHeader(req) ?? null;

    if (!token) throw new UnauthorizedException();

    const decoded = this.jwtTokenService.verifyToken(token);
    if (!isUserPayload(decoded)) throw new UnauthorizedException('Invalid token payload');

    req.user = decoded;
    return true;
  }

  private getJwtTokenFromAuthHeader(req: Request): string | undefined {
    const authHeader = req.headers['authorization'];
    if (!isString(authHeader)) return undefined;

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) return undefined;

    return token;
  }

  private getJwtTokenFromCookie(req: Request): string | undefined {
    if (!hasCookies(req)) return undefined;
    if (!isRecord(req.cookies)) return undefined;
    const cookies = req.cookies;
    if (!hasAccessTokenInCookies(cookies)) return undefined;
    return cookies.access_token;
  }
}
