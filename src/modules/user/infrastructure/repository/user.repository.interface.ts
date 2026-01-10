import { User } from '@module/user/domain/entities/user.entity';

export interface IUserRepository {
  /**
   * 모든 사용자 조회 (관리자용)
   */
  findAll(): Promise<User[]>;

  /**
   * ID로 사용자 조회
   */
  findById(id: string): Promise<User | null>;

  /**
   * 이메일로 사용자 조회
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * 닉네임으로 사용자 조회
   */
  findByNickname(nickname: string): Promise<User | null>;

  /**
   * 전화번호로 사용자 조회
   */
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;

  /**
   * 사용자명으로 조회 (관리자 계정용)
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * 소셜 계정으로 사용자 조회
   */
  findBySocialAccount(provider: string, providerUserId: string): Promise<User | null>;

  /**
   * 사용자 생성
   */
  create(user: User): Promise<User>;

  /**
   * 사용자 정보 수정
   */
  update(id: string, data: Partial<User>): Promise<User>;

  /**
   * 사용자 영구 삭제
   */
  delete(id: string): Promise<void>;

  /**
   * 사용자 탈퇴 처리 (leftAt 설정)
   */
  softDelete(id: string): Promise<User>;

  /**
   * 사용자의 소셜 계정이 존재하는지 확인
   */
  existsSocialAccount(userId: string): Promise<boolean>;

  /**
   * 사용자의 소셜 계정 개수 확인
   */
  countSocialAccounts(userId: string): Promise<number>;
}

export const USER_REPOSITORY_TOKEN = Symbol('IUserRepository');
