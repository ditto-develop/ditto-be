import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '@module/user/domain/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    console.log('[AuthService] AuthService 초기화');
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      userId: user.id,
      roleId: user.roleId,
      roleCode: user.role.code,
      username: user.username,
      name: user.name,
      email: user.email,
      type: 'access',
    };

    const accessSecret = this.configService.get<string>('jwt.accessSecret');
    const accessExpiresIn = (this.configService.get<string>('jwt.accessExpiresIn') ??
      '15m') as SignOptions['expiresIn'];

    const signOptions: JwtSignOptions = {
      secret: accessSecret,
      expiresIn: accessExpiresIn,
    };

    return this.jwtService.sign(payload, signOptions);
  }

  // 기존 메서드 호환성을 위해 유지
  async generateToken(user: User): Promise<string> {
    return this.generateAccessToken(user);
  }
}
