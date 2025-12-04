import { Role } from '@module/role/domain/entities/role.entity';

/**
 * Role Repository 인터페이스
 * 도메인 계층에서 사용하는 리포지토리 인터페이스
 */
export interface IRoleRepository {
  /**
   * 모든 Role 조회
   */
  findAll(): Promise<Role[]>;

  /**
   * ID로 Role 조회
   */
  findById(id: number): Promise<Role | null>;

  /**
   * 코드로 Role 조회
   */
  findByCode(code: string): Promise<Role | null>;

  /**
   * 여러 코드로 Role 조회
   */
  findByCodes(codes: string[]): Promise<Role[]>;

  /**
   * Role 존재 여부 확인
   */
  exists(name: string): Promise<boolean>;
}

/**
 * Role Repository 토큰
 */
export const ROLE_REPOSITORY_TOKEN = Symbol('IRoleRepository');
