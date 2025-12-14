import { SetMetadata } from '@nestjs/common';
import { RoleCode } from '@module/role/domain/entities/role.entity';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RoleCode[]) => SetMetadata(ROLES_KEY, roles);
