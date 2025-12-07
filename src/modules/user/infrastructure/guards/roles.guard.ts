import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@module/user/domain/entities/user.entity';
import { RoleCode } from '@module/role/domain/entities/role.entity';
import { ROLES_KEY } from '@module/user/infrastructure/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    console.log('[RolesGuard] RolesGuard 초기화');
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleCode[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new ForbiddenException('사용자 정보를 찾을 수 없습니다.');
    }

    const hasRole = requiredRoles.some((role) => {
      switch (role) {
        case RoleCode.SUPER_ADMIN:
          return user.role.code === RoleCode.SUPER_ADMIN;
        case RoleCode.ADMIN:
          return user.role.code === RoleCode.ADMIN || user.role.code === RoleCode.SUPER_ADMIN;
        case RoleCode.USER:
          return user.role.code === RoleCode.USER;
        default:
          return false;
      }
    });

    if (!hasRole) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return true;
  }
}
