import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@module/user/domain/entities/user.entity';
import {
  USER_REPOSITORY_TOKEN,
  IUserRepository,
} from '@module/user/infrastructure/repository/user.repository.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: IUserRepository,
  ) {
    console.log('[JwtAuthGuard] JwtAuthGuard 초기화');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: User }>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('토큰이 제공되지 않았습니다.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (!payload.sub) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      const user = await this.userRepository.findById(payload.sub);

      if (!user || !user.isActive()) {
        throw new UnauthorizedException('사용자를 찾을 수 없거나 비활성 상태입니다.');
      }

      request.user = user;
      return true;
    } catch (error) {
      console.error('[JwtAuthGuard] 토큰 검증 실패:', error);
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
