import { Injectable } from '@nestjs/common';
import { JwtTokenService } from '../../shared/infrastructure/jwt/jwt.token.service';
import { nanoid } from 'nanoid';

export interface UserRecord {
  id: string;
  email?: string | null;
  referral_token: string;
  created_at: Date;
}

@Injectable()
export class AuthService {
  private readonly users = new Map<string, UserRecord>();

  constructor(private readonly jwtTokenService: JwtTokenService) {}

  createAnonymousUser(referred_token?: string | null): { user: UserRecord; jwt: string } {
    // TODO:: 실제: userService.createUser(referred_token);
    const id = nanoid();
    const referral_token = nanoid();
    const user: UserRecord = { id, email: null, referral_token, created_at: new Date() };
    this.users.set(id, user);
    const jwt = this.jwtTokenService.signToken({ id, email: null });
    return { user, jwt };
  }

  updateEmail(id: string, email: string): UserRecord | null {
    const user = this.users.get(id);
    if (!user) return null;
    user.email = email;
    this.users.set(id, user);
    return user;
  }
}
