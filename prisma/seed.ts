import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { seedRoles } from './seed/roles.seed';
import { seedSuperAdmin } from './seed/users.seed';
import { seedQuizSets } from './seed/quiz.seed';

dotenv.config();

const prisma = new PrismaClient();

// 실행 방법: `pnpm prisma db seed` (package.json의 prisma.seed 참조)
// 주의: SUPER_ADMIN 시드 자격 증명은 운영 환경에 맞게 변경하세요.

async function main() {
  try {
    await seedRoles(prisma);
    await seedSuperAdmin(prisma);
    await seedQuizSets(prisma);
    console.log('[seed] 완료');
  } catch (error) {
    console.error('[seed] 실패:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
