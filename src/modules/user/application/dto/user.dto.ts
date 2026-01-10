import { Gender } from '@module/user/domain/entities/user.entity';
import { RoleDto } from '@module/role/application/dto/role.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsInt, IsEmail, Min, Max } from 'class-validator';

export class UserDto {
  @ApiProperty({ description: '사용자 ID' })
  id: string;

  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: '전화번호' })
  phoneNumber: string;

  @ApiProperty({ description: '이메일', required: false })
  email: string | null;

  @ApiProperty({ description: '성별' })
  gender: Gender;

  @ApiProperty({ description: '나이' })
  age: number;

  @ApiProperty({ description: '생년월일', required: false })
  birthDate: Date | null;

  @ApiProperty({ description: '가입일' })
  joinedAt: Date;

  @ApiProperty({ description: '탈퇴일', required: false })
  leftAt: Date | null;

  @ApiProperty({ description: '역할 정보' })
  role: RoleDto;

  @ApiProperty({ description: '소셜 계정 목록' })
  socialAccounts: UserSocialAccountDto[];

  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    nickname: string,
    phoneNumber: string,
    email: string | null,
    gender: Gender,
    age: number,
    birthDate: Date | null,
    joinedAt: Date,
    leftAt: Date | null,
    role: RoleDto,
    socialAccounts: UserSocialAccountDto[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.nickname = nickname;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.gender = gender;
    this.age = age;
    this.birthDate = birthDate;
    this.joinedAt = joinedAt;
    this.leftAt = leftAt;
    this.role = role;
    this.socialAccounts = socialAccounts;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDomain(user: any): UserDto {
    return new UserDto(
      user.id,
      user.name,
      user.nickname,
      user.phoneNumber,
      user.email,
      user.gender,
      user.age,
      user.birthDate,
      user.joinedAt,
      user.leftAt,
      RoleDto.fromDomain(user.role),
      user.socialAccounts.map((account: any) => UserSocialAccountDto.fromDomain(account)),
      user.createdAt,
      user.updatedAt,
    );
  }
}

export class UserSocialAccountDto {
  @ApiProperty({ description: '소셜 계정 ID' })
  id: number;

  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '소셜 로그인 제공자' })
  provider: string;

  @ApiProperty({ description: '제공자의 사용자 ID' })
  providerUserId: string;

  constructor(id: number, userId: string, provider: string, providerUserId: string) {
    this.id = id;
    this.userId = userId;
    this.provider = provider;
    this.providerUserId = providerUserId;
  }

  static fromDomain(account: any): UserSocialAccountDto {
    return new UserSocialAccountDto(account.id, account.userId, account.provider, account.providerUserId);
  }
}

export class CreateAdminUserDto {
  @ApiProperty({ description: '이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '닉네임' })
  @IsString()
  nickname: string;

  @ApiProperty({ description: '전화번호' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: '이메일', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '관리자 사용자명' })
  @IsString()
  username: string;

  @ApiProperty({ description: '비밀번호' })
  @IsString()
  password: string;

  @ApiProperty({ description: '성별' })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: '나이' })
  @IsInt()
  @Min(0)
  @Max(150)
  age: number;

  @ApiProperty({ description: '생년월일', required: false })
  @IsOptional()
  birthDate?: Date;

  @ApiProperty({ description: '역할 ID' })
  @IsInt()
  roleId: number;
}

export class CreateUserDto {
  @ApiProperty({ description: '이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '닉네임' })
  @IsString()
  nickname: string;

  @ApiProperty({ description: '전화번호' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: '이메일', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '성별' })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: '나이' })
  @IsInt()
  @Min(0)
  @Max(150)
  age: number;

  @ApiProperty({ description: '생년월일', required: false })
  @IsOptional()
  birthDate?: Date;

  @ApiProperty({ description: '소셜 로그인 제공자' })
  @IsString()
  provider: string;

  @ApiProperty({ description: '제공자의 사용자 ID' })
  @IsString()
  providerUserId: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: '이름', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '닉네임', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: '전화번호', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: '이메일', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class LoginDto {
  @ApiProperty({ description: '관리자 사용자명' })
  @IsString()
  username: string;

  @ApiProperty({ description: '비밀번호' })
  @IsString()
  password: string;
}

export class SocialLoginDto {
  @ApiProperty({ description: '소셜 로그인 제공자' })
  @IsString()
  provider: string;

  @ApiProperty({ description: '제공자의 사용자 ID' })
  @IsString()
  providerUserId: string;
}

export class CheckNicknameAvailabilityDto {
  @ApiProperty({ description: '닉네임' })
  @IsString()
  nickname: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: '액세스 토큰' })
  accessToken: string;

  @ApiProperty({ description: '리프레시 토큰 (쿠키로 설정)', required: false })
  refreshToken?: string;

  @ApiProperty({ description: '사용자 정보' })
  user: UserDto;
}
