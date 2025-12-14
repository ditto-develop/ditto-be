import { Role } from '@module/role/domain/entities/role.entity';
import { UserSocialAccount } from '@module/user/domain/entities/user-social-account.entity';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface UserUpdateProps {
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  email?: string | null;
  username?: string | null;
  passwordHash?: string | null;
  gender?: Gender;
  age?: number;
  birthDate?: Date | null;
  roleId?: number;
  role?: Role;
  leftAt?: Date | null;
}

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly nickname: string,
    public readonly phoneNumber: string,
    public readonly email: string | null,
    public readonly username: string | null,
    public readonly passwordHash: string | null,
    public readonly gender: Gender,
    public readonly age: number,
    public readonly birthDate: Date | null,
    public readonly joinedAt: Date,
    public readonly leftAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly roleId: number,
    public readonly role: Role,
    public readonly socialAccounts: UserSocialAccount[],
  ) {}

  static create(
    id: string,
    name: string,
    nickname: string,
    phoneNumber: string,
    email: string | null,
    username: string | null,
    passwordHash: string | null,
    gender: Gender,
    age: number,
    birthDate: Date | null,
    joinedAt: Date,
    roleId: number,
    role: Role,
    socialAccounts: UserSocialAccount[] = [],
    leftAt: Date | null = null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ): User {
    return new User(
      id,
      name,
      nickname,
      phoneNumber,
      email,
      username,
      passwordHash,
      gender,
      age,
      birthDate,
      joinedAt,
      leftAt,
      createdAt,
      updatedAt,
      roleId,
      role,
      socialAccounts,
    );
  }

  /**
   * 사용자가 활성 상태인지 확인 (탈퇴하지 않은 사용자)
   */
  isActive(): boolean {
    return this.leftAt === null;
  }

  /**
   * 사용자가 관리자 권한을 가지고 있는지 확인
   */
  isAdmin(): boolean {
    return this.role.code === 'SUPER_ADMIN' || this.role.code === 'ADMIN';
  }

  /**
   * 사용자가 일반 사용자인지 확인
   */
  isUser(): boolean {
    return this.role.code === 'USER';
  }

  /**
   * 현재 사용자가 이 사용자 정보를 접근할 수 있는지 확인
   */
  canBeAccessedBy(currentUser: User): boolean {
    // 관리자는 모든 사용자 정보에 접근 가능
    if (currentUser.isAdmin()) {
      return true;
    }

    // 일반 사용자는 본인 정보만 접근 가능
    return this.id === currentUser.id;
  }

  /**
   * 현재 사용자가 이 사용자를 수정할 수 있는지 확인
   */
  canBeModifiedBy(currentUser: User): boolean {
    return this.canBeAccessedBy(currentUser);
  }

  /**
   * 현재 사용자가 이 사용자를 삭제할 수 있는지 확인 (관리자만)
   */
  canBeDeletedBy(currentUser: User): boolean {
    return currentUser.isAdmin();
  }

  /**
   * 주어진 필드를 수정할 수 있는지 권한에 따라 확인
   */
  canModify(field: keyof User, currentUser: User): boolean {
    // 관리자는 모든 필드를 수정할 수 있음
    if (currentUser.isAdmin()) {
      return true;
    }

    // 사용자는 자신의 정보만 수정 가능하고, 특정 필드만 수정 가능
    if (this.id !== currentUser.id) {
      return false;
    }

    // 사용자가 수정할 수 없는 필드들
    const nonModifiableFields: (keyof User)[] = [
      'id',
      'username',
      'passwordHash',
      'gender',
      'age',
      'birthDate',
      'joinedAt',
      'role',
      'roleId',
    ];

    return !nonModifiableFields.includes(field);
  }

  /**
   * 사용자 정보 업데이트 (새로운 인스턴스 반환)
   */
  update(partialData: UserUpdateProps): User {
    return new User(
      this.id,
      partialData.name ?? this.name,
      partialData.nickname ?? this.nickname,
      partialData.phoneNumber ?? this.phoneNumber,
      partialData.email ?? this.email,
      partialData.username ?? this.username,
      partialData.passwordHash ?? this.passwordHash,
      partialData.gender ?? this.gender,
      partialData.age ?? this.age,
      partialData.birthDate ?? this.birthDate,
      this.joinedAt,
      partialData.leftAt ?? this.leftAt,
      this.createdAt,
      new Date(), // updatedAt
      partialData.roleId ?? this.roleId,
      partialData.role ?? this.role,
      this.socialAccounts,
    );
  }

  /**
   * 사용자 정보 유효성 검증
   */
  validate(): void {
    if (!this.name?.trim()) {
      throw new Error('이름은 필수입니다.');
    }
    if (!this.nickname?.trim()) {
      throw new Error('닉네임은 필수입니다.');
    }
    if (!this.phoneNumber?.trim()) {
      throw new Error('전화번호는 필수입니다.');
    }
    if (![Gender.MALE, Gender.FEMALE].includes(this.gender)) {
      throw new Error('성별은 MALE 또는 FEMALE만 가능합니다.');
    }
    if (this.age < 0 || this.age > 150) {
      throw new Error('나이는 0-150 사이여야 합니다.');
    }

    // 관리자 계정의 경우 username과 passwordHash 필수
    if (this.isAdmin()) {
      if (!this.username?.trim()) {
        throw new Error('관리자 계정은 사용자명이 필수입니다.');
      }
      if (!this.passwordHash?.trim()) {
        throw new Error('관리자 계정은 비밀번호가 필수입니다.');
      }
    }

    // 일반 사용자의 경우 최소 하나의 소셜 계정이 있어야 함
    if (this.isUser() && (!this.socialAccounts || this.socialAccounts.length === 0)) {
      throw new Error('일반 사용자는 최소 하나의 소셜 계정이 있어야 합니다.');
    }
  }
}
