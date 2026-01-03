import { PrismaClient } from '@prisma/client';

export const ROLE_CODES = [
  { code: 'SUPER_ADMIN', name: '최고 관리자' },
  { code: 'ADMIN', name: '관리자' },
  { code: 'USER', name: '사용자' },
];

export async function seedRoles(prisma: PrismaClient): Promise<void> {
  console.log('[seed] 역할 upsert 시작');
  for (const role of ROLE_CODES) {
    await prisma.role.upsert({
      where: { code: role.code },
      create: role,
      update: { name: role.name },
    });
    console.log(`[seed] 역할 보장: ${role.code}`);
  }
}

