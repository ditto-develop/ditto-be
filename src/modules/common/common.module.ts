import { EncryptionService } from '@module/common/services/encryption.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class CommonModule {}
