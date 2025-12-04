import { PrismaService } from '@module/common/prisma/prisma.service';
import { Role } from '@module/role/domain/entities/role.entity';
import { IRoleRepository } from '@module/role/infrastructure/repository/role.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaService) {
    console.log('[RoleRepository] RoleRepository 초기화');
  }

  async findAll(): Promise<Role[]> {
    console.log('[RoleRepository] 모든 Role 조회');
    const roles = await this.prisma.role.findMany({
      orderBy: { id: 'asc' },
    });
    return roles.map((role) => this.toDomain(role));
  }

  async findById(id: number): Promise<Role | null> {
    console.log('[RoleRepository] Role 조회', id);
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    return role ? this.toDomain(role) : null;
  }

  async findByCode(code: string): Promise<Role | null> {
    console.log('[RoleRepository] Role 조회', code);
    const role = await this.prisma.role.findUnique({
      where: { code },
    });
    return role ? this.toDomain(role) : null;
  }

  async findByCodes(codes: string[]): Promise<Role[]> {
    console.log(`[RoleRepository] Role 조회: codes=${codes.join(', ')}`);
    const roles = await this.prisma.role.findMany({
      where: {
        code: {
          in: codes,
        },
      },
    });
    return roles.map((role) => this.toDomain(role));
  }

  async exists(name: string): Promise<boolean> {
    console.log('[RoleRepository] Role 존재 여부 확인', name);
    const count = await this.prisma.role.count({
      where: {
        name,
      },
    });
    return count > 0;
  }

  private toDomain(role: { id: number; code: string; name: string; createdAt: Date; updatedAt: Date }): Role {
    return Role.create(role.id, role.code, role.name, role.createdAt, role.updatedAt);
  }
}
