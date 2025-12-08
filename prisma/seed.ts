import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

// 실행 방법: `pnpm prisma db seed` (package.json의 prisma.seed 참조)
// 주의: SUPER_ADMIN 시드 자격 증명은 운영 환경에 맞게 변경하세요.
const ROLE_CODES = [
  { code: 'SUPER_ADMIN', name: '최고 관리자' },
  { code: 'ADMIN', name: '관리자' },
  { code: 'USER', name: '사용자' },
];

const SUPER_ADMIN_SEED = {
  username: 'admin',
  password: '1234',
  name: '홍길동',
  nickname: '최고관리자',
  phoneNumber: '01012345678',
  email: null as string | null,
  gender: 'MALE',
  age: 30,
  birthDate: '1996-11-30',
};

async function seedRoles() {
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

async function seedSuperAdmin() {
  console.log('[seed] SUPER_ADMIN 계정 upsert 시작');

  const superAdminRole = await prisma.role.findUnique({ where: { code: 'SUPER_ADMIN' } });
  if (!superAdminRole) {
    throw new Error('SUPER_ADMIN 역할이 존재하지 않습니다. 역할 시드를 먼저 확인하세요.');
  }

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_SEED.password, 10);

  await prisma.user.upsert({
    where: { username: SUPER_ADMIN_SEED.username },
    create: {
      id: crypto.randomUUID(),
      name: SUPER_ADMIN_SEED.name,
      nickname: SUPER_ADMIN_SEED.nickname,
      phoneNumber: SUPER_ADMIN_SEED.phoneNumber,
      email: SUPER_ADMIN_SEED.email,
      username: SUPER_ADMIN_SEED.username,
      passwordHash,
      gender: SUPER_ADMIN_SEED.gender,
      age: SUPER_ADMIN_SEED.age,
      birthDate: new Date(SUPER_ADMIN_SEED.birthDate),
      joinedAt: new Date(),
      roleId: superAdminRole.id,
    },
    update: {
      name: SUPER_ADMIN_SEED.name,
      nickname: SUPER_ADMIN_SEED.nickname,
      phoneNumber: SUPER_ADMIN_SEED.phoneNumber,
      email: SUPER_ADMIN_SEED.email,
      passwordHash,
      gender: SUPER_ADMIN_SEED.gender,
      age: SUPER_ADMIN_SEED.age,
      birthDate: new Date(SUPER_ADMIN_SEED.birthDate),
      roleId: superAdminRole.id,
      leftAt: null,
    },
  });

  console.log('[seed] SUPER_ADMIN 계정 upsert 완료');
}

async function main() {
  try {
    await seedRoles();
    await seedSuperAdmin();
    console.log('[seed] 완료');
  } catch (error) {
    console.error('[seed] 실패:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
