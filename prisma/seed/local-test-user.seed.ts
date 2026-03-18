/**
 * 로컬 테스트용 가짜 계정 시드
 * - localhost 개발 환경에서 카카오 로그인 없이 접속하기 위한 계정
 * - 실행: npx ts-node -r tsconfig-paths/register prisma/seed/local-test-user.seed.ts
 *
 * 계정 정보:
 *   username: localtest
 *   password: test1234
 */

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LOCAL_TEST_USER = {
  username: 'localtest',
  password: 'test1234',
  name: '김지수',
  nickname: '지수테스터',
  phoneNumber: '01099990001',
  email: 'localtest@ditto.local',
  gender: 'FEMALE',
  age: 25,
  birthDate: '2000-03-17',
  profileImageUrl: '/assets/avatar/f3.svg',
};

async function main() {
  console.log('=== 로컬 테스트 유저 시드 시작 ===');

  const userRole = await prisma.role.findFirst({ where: { code: 'USER' } });
  if (!userRole) throw new Error('USER role not found. Run main seed first.');

  const passwordHash = await bcrypt.hash(LOCAL_TEST_USER.password, 10);

  const user = await prisma.user.upsert({
    where: { username: LOCAL_TEST_USER.username },
    create: {
      id: crypto.randomUUID(),
      name: LOCAL_TEST_USER.name,
      nickname: LOCAL_TEST_USER.nickname,
      phoneNumber: LOCAL_TEST_USER.phoneNumber,
      email: LOCAL_TEST_USER.email,
      username: LOCAL_TEST_USER.username,
      passwordHash,
      gender: LOCAL_TEST_USER.gender,
      age: LOCAL_TEST_USER.age,
      birthDate: new Date(LOCAL_TEST_USER.birthDate),
      joinedAt: new Date(),
      roleId: userRole.id,
      socialAccounts: {
        create: {
          provider: 'local',
          providerUserId: `local_${LOCAL_TEST_USER.username}`,
        },
      },
      profile: {
        create: {
          introduction: '로컬 테스트용 계정입니다.',
          location: '서울',
          occupation: '개발자',
          interests: ['개발', '카페', '음악'],
          profileImageUrl: LOCAL_TEST_USER.profileImageUrl,
        },
      },
    },
    update: {
      passwordHash,
      leftAt: null,
    },
  });

  console.log(`✅ 로컬 테스트 유저 생성/업데이트 완료`);
  console.log(`   닉네임: ${user.nickname}`);
  console.log(`   username: ${LOCAL_TEST_USER.username}`);
  console.log(`   password: ${LOCAL_TEST_USER.password}`);
  console.log(`   로그인 URL: http://localhost:3000/localogin`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
