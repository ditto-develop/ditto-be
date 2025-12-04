export class Role {
  constructor(
    public readonly id: number,
    public readonly code: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: number,
    code: string,
    name: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ): Role {
    return new Role(id, code, name, createdAt, updatedAt);
  }

  isValid(): boolean {
    return !!this.code && !!this.name;
  }

  hasCode(code: string): boolean {
    return this.code === code;
  }
}

export enum RoleCode {
  SUPER_ADMIN = 'SUPER_ADMIN', // 최고 관리자
  ADMIN = 'ADMIN', // 관리자
  USER = 'USER', // 사용자
}

export const RoleNameMap: Record<RoleCode, string> = {
  [RoleCode.SUPER_ADMIN]: '최고 관리자',
  [RoleCode.ADMIN]: '관리자',
  [RoleCode.USER]: '사용자',
} as const;
