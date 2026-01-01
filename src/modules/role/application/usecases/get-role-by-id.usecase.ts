import { EntityNotFoundException } from '@common/exceptions/domain.exception';
import { Role } from '@module/role/domain/entities/role.entity';
import {
  ROLE_REPOSITORY_TOKEN,
  IRoleRepository,
} from '@module/role/infrastructure/repository/role.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetRoleByIdUseCase {
  constructor(@Inject(ROLE_REPOSITORY_TOKEN) private readonly roleRepo: IRoleRepository) {
    console.log('[GetRoleByIdUseCase] GetRoleByIdUseCase 초기화');
  }

  async execute(id: number): Promise<Role> {
    console.log(`[GetRoleByIdUseCase] Role 조회 실행: id=${id}`);
    const role = await this.roleRepo.findById(id);

    if (!role) {
      throw new EntityNotFoundException('역할', id);
    }

    return role;
  }
}
