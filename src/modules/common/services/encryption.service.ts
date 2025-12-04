import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm: string = 'aes-256-gcm';
  private readonly keyLength: number = 32;
  private readonly ivLength: number = 16;
  private readonly authTagLength: number = 16;
  private readonly encryptionKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('encryption.key');
    if (!key) {
      throw new Error('ENCRYPTION_KEY 환경 변수가 설정되지 않았습니다.');
    }

    // Base64로 인코딩된 키를 디코딩하거나, 직접 문자열을 사용
    try {
      // Base64 디코딩 시도
      this.encryptionKey = Buffer.from(key, 'base64');
      if (this.encryptionKey.length !== this.keyLength) {
        // Base64가 아니면 문자열을 직접 사용하고 해시
        const hash = crypto.createHash('sha256').update(key).digest();
        this.encryptionKey = hash;
      }
    } catch {
      // Base64 디코딩 실패 시 문자열을 해시하여 사용
      const hash = crypto.createHash('sha256').update(key).digest();
      this.encryptionKey = hash;
    }

    if (this.encryptionKey.length !== this.keyLength) {
      throw new Error(`암호화 키는 ${this.keyLength}바이트여야 합니다.`);
    }

    console.log('[EncryptionService] EncryptionService 초기화 완료');
  }

  /**
   * 평문을 암호화
   * @param plainText 평문
   * @returns Base64로 인코딩된 암호문 (IV: 암호문:AuthTag 형식)
   */
  encrypt(plainText: string): string {
    if (!plainText) {
      return plainText;
    }

    try {
      // IV 생성
      const iv = crypto.randomBytes(this.ivLength);

      // 암호화기 생성
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

      // 암호화
      let encrypted = cipher.update(plainText, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // 인증 태그 가져오기
      const authTag = (cipher as crypto.CipherGCM).getAuthTag();

      // IV:암호문:AuthTag 형식으로 결합하여 Base64 인코딩
      const combined = Buffer.concat([iv, Buffer.from(encrypted, 'base64'), authTag]);

      return combined.toString('base64');
    } catch (error) {
      console.error('[EncryptionService] 암호화 실패:', error);
      throw new Error('암호화 중 오류가 발생했습니다.');
    }
  }

  /**
   * 암호문을 복호화
   * @param encrypted Base64로 인코딩된 암호문 (IV: 암호문:AuthTag 형식)
   * @returns 복호화된 평문
   */
  decrypt(encrypted: string): string {
    if (!encrypted) {
      return encrypted;
    }

    // 이미 암호화되지 않은 평문인지 확인 (기존 데이터 호환성)
    // 암호화된 데이터는 Base64 형식이고, 길이가 충분히 길어야 함
    if (encrypted.length < this.ivLength + this.authTagLength) {
      // 암호화되지 않은 평문으로 간주하고 그대로 반환
      return encrypted;
    }

    try {
      // Base64로 디코딩
      const combined = Buffer.from(encrypted, 'base64');

      // 최소 길이 확인
      if (combined.length < this.ivLength + this.authTagLength) {
        // 암호화되지 않은 평문으로 간주
        return encrypted;
      }

      // IV:암호문:AuthTag 형식으로 분리
      const iv = combined.subarray(0, this.ivLength);
      const authTag = combined.subarray(combined.length - this.authTagLength);
      const ciphertext = combined.subarray(this.ivLength, combined.length - this.authTagLength);

      // 복호화기 생성
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      (decipher as crypto.DecipherGCM).setAuthTag(authTag);

      // 복호화
      let decrypted = decipher.update(ciphertext, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      // 복호화 실패 시 기존 평문으로 간주하고 그대로 반환 (기존 데이터 호환성)
      console.warn('[EncryptionService] 복호화 실패, 평문으로 간주:', error);
      return encrypted;
    }
  }

  /**
   * 문자열이 암호화되었는지 확인
   * @param value 확인할 값
   * @returns 암호화되었으면 true, 아니면 false
   */
  isEncrypted(value: string): boolean {
    if (!value || value.length < this.ivLength + this.authTagLength) {
      return false;
    }

    try {
      const combined = Buffer.from(value, 'base64');
      return combined.length >= this.ivLength + this.authTagLength;
    } catch {
      return false;
    }
  }
}
