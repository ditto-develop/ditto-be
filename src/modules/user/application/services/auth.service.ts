import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@module/user/domain/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {
    console.log('[AuthService] AuthService 초기화');
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      userId: user.id,
      roleId: user.roleId,
      roleCode: user.role.code,
      username: user.username,
      name: user.name,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }
}
