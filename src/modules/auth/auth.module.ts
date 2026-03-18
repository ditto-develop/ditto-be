import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { KakaoController } from './kakao.controller';
import { KakaoService } from './kakao.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn = configService.get<string>('jwt.accessExpiresIn') || '15m';
        return {
          secret: configService.get<string>('jwt.accessSecret'),
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [KakaoController],
  providers: [KakaoService],
  exports: [JwtModule],
})
export class AuthModule {}

