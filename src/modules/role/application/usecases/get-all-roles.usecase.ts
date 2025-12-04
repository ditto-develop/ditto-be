import { Role } from '@module/role/domain/entities/role.entity';
import {
  ROLE_REPOSITORY_TOKEN,
  IRoleRepository,
} from '@module/role/infrastructure/repository/role.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetAllRolesUseCase {
  constructor(@Inject(ROLE_REPOSITORY_TOKEN) private readonly roleRepo: IRoleRepository) {
    console.log('[GetAllRolesUseCase] GetAllRolesUseCase 초기화');
  }

  async execute(): Promise<Role[]> {
    console.log('[GetAllRolesUseCase] 모든 Role 조회 실행');
    return await this.roleRepo.findAll();
  }
}
