import { Global, Module } from '@nestjs/common';
import { EncryptionService } from 'src/modules/common/services/encryption.service.js';

@Global()
@Module({
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class CommonModule {}
