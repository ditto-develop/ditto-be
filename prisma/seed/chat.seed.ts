/**
 * 로컬 개발용 채팅 시드
 * - 로컬 테스트 유저(localtest)를 기준으로 채팅방과 메시지를 생성합니다.
 * - 진행중 채팅방 1개 (expiresAt = 미래), 종료 채팅방 2개 (expiresAt = 과거)
 *
 * 사전 조건:
 *   1. roles.seed.ts 실행 완료
 *   2. local-test-user.seed.ts 실행 완료
 *
 * 실행:
 *   npx ts-node -r tsconfig-paths/register prisma/seed/chat.seed.ts
 */

import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FEMALE_AVATARS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];
const MALE_AVATARS = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];

function randomAvatar(gender: string): string {
  const pool = gender === 'FEMALE' ? FEMALE_AVATARS : MALE_AVATARS;
  const file = pool[Math.floor(Math.random() * pool.length)];
  return `/assets/avatar/${file}.png`;
}

const PARTNER_USERS = [
  {
    name: '박서연',
    nickname: '서연이',
    phoneNumber: '01011110001',
    email: 'chat_partner1@ditto.local',
    username: 'chat_partner1',
    password: 'test1234',
    gender: 'FEMALE',
    age: 24,
    birthDate: '2001-05-12',
    intro: '안녕하세요! 카페 투어를 좋아해요.',
  },
  {
    name: '이민준',
    nickname: '민준',
    phoneNumber: '01011110002',
    email: 'chat_partner2@ditto.local',
    username: 'chat_partner2',
    password: 'test1234',
    gender: 'MALE',
    age: 26,
    birthDate: '1999-08-23',
    intro: '독서와 영화를 좋아합니다.',
  },
  {
    name: '최하은',
    nickname: '하은',
    phoneNumber: '01011110003',
    email: 'chat_partner3@ditto.local',
    username: 'chat_partner3',
    password: 'test1234',
    gender: 'FEMALE',
    age: 25,
    birthDate: '2000-02-14',
    intro: '음악과 여행을 즐깁니다.',
  },
];

const MESSAGES_ROOM1 = [
  { fromMe: false, content: '안녕하세요! 매칭됐네요 😊' },
  { fromMe: true, content: '안녕하세요! 반가워요!' },
  { fromMe: false, content: '저는 서연이에요. 카페 투어 좋아하시나요?' },
  { fromMe: true, content: '네! 저도 카페 자주 가요. 어떤 동네 카페 좋아하세요?' },
  { fromMe: false, content: '성수랑 연남동 쪽을 주로 가요 ☕️' },
  { fromMe: true, content: '오 저도 성수 자주 가는데! 같이 가볼까요?' },
  { fromMe: false, content: '좋아요! 언제 시간 되세요?' },
  { fromMe: true, content: '이번 주말 어떠세요?' },
];

const MESSAGES_ROOM2 = [
  { fromMe: false, content: '안녕하세요 지수테스터님!' },
  { fromMe: true, content: '반가워요 민준씨!' },
  { fromMe: false, content: '어떤 책 좋아하세요?' },
  { fromMe: true, content: '소설 위주로 읽어요. 요즘은 한강 작가 책 읽고 있어요.' },
  { fromMe: false, content: '저도 채식주의자 읽었어요. 정말 인상 깊었죠.' },
];

const MESSAGES_ROOM3 = [
  { fromMe: false, content: '안녕하세요! 하은이에요 🎵' },
  { fromMe: true, content: '안녕하세요! 반가워요!' },
  { fromMe: false, content: '어떤 음악 좋아하세요?' },
  { fromMe: true, content: 'R&B 좋아해요! 하은씨는요?' },
  { fromMe: false, content: '저도요! 혹시 Frank Ocean 아세요?' },
  { fromMe: true, content: '당연하죠 팬이에요 ㅎㅎ' },
];

async function upsertPartnerUser(partner: (typeof PARTNER_USERS)[0], roleId: number) {
  const user = await prisma.user.upsert({
    where: { username: partner.username },
    create: {
      id: crypto.randomUUID(),
      name: partner.name,
      nickname: partner.nickname,
      phoneNumber: partner.phoneNumber,
      email: partner.email,
      username: partner.username,
      passwordHash: 'chat_seed_placeholder',
      gender: partner.gender,
      age: partner.age,
      birthDate: new Date(partner.birthDate),
      joinedAt: new Date(),
      roleId,
      profile: {
        create: {
          introduction: partner.intro,
          location: '서울',
          occupation: '직장인',
          interests: ['독서', '음악', '카페'],
          profileImageUrl: randomAvatar(partner.gender),
        },
      },
    },
    update: {},
  });
  return user;
}

async function createChatRoom(
  meId: string,
  partnerId: string,
  messages: { fromMe: boolean; content: string }[],
  expiresAt: Date,
  label: string,
) {
  // 같은 두 유저 간 기존 방 확인 (중복 방지)
  const existing = await prisma.chatRoom.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: meId } } },
        { participants: { some: { userId: partnerId } } },
        { quizSetId: null },
      ],
    },
  });
  if (existing) {
    console.log(`  ⚠️  ${label}: 이미 존재하는 방 (${existing.id}) - 스킵`);
    return existing;
  }

  const now = new Date();
  const room = await prisma.chatRoom.create({
    data: {
      id: crypto.randomUUID(),
      expiresAt,
      participants: {
        create: [{ userId: meId }, { userId: partnerId }],
      },
    },
  });

  // 메시지 생성 (과거 순서대로)
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const createdAt = new Date(now.getTime() - (messages.length - i) * 5 * 60 * 1000); // 5분 간격
    await prisma.chatMessage.create({
      data: {
        id: crypto.randomUUID(),
        roomId: room.id,
        senderId: msg.fromMe ? meId : partnerId,
        content: msg.content,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }

  // 방 updatedAt을 마지막 메시지 시각으로 갱신
  await prisma.chatRoom.update({
    where: { id: room.id },
    data: { updatedAt: now },
  });

  console.log(`  ✅ ${label}: 방 생성 완료 (${room.id})`);
  return room;
}

async function main() {
  console.log('=== 채팅 시드 시작 ===\n');

  // 1. USER 롤 조회
  const userRole = await prisma.role.findFirst({ where: { code: 'USER' } });
  if (!userRole) throw new Error('USER role not found. Run roles.seed.ts first.');

  // 2. 로컬 테스트 유저 조회
  const me = await prisma.user.findFirst({ where: { username: 'localtest' } });
  if (!me) throw new Error('localtest user not found. Run local-test-user.seed.ts first.');
  console.log(`[나] ${me.nickname} (${me.id})\n`);

  // 3. 파트너 유저 생성
  console.log('[파트너 유저 생성]');
  const partner1 = await upsertPartnerUser(PARTNER_USERS[0], userRole.id);
  const partner2 = await upsertPartnerUser(PARTNER_USERS[1], userRole.id);
  const partner3 = await upsertPartnerUser(PARTNER_USERS[2], userRole.id);
  console.log(`  ✅ ${partner1.nickname}, ${partner2.nickname}, ${partner3.nickname}\n`);

  // 4. 채팅방 생성
  const now = new Date();
  console.log('[채팅방 생성]');

  // 진행중 (expiresAt = 48시간 후)
  await createChatRoom(
    me.id, partner1.id, MESSAGES_ROOM1,
    new Date(now.getTime() + 48 * 60 * 60 * 1000),
    '진행중 (서연이)',
  );

  // 종료 1 (expiresAt = 3일 전)
  await createChatRoom(
    me.id, partner2.id, MESSAGES_ROOM2,
    new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    '종료1 (민준)',
  );

  // 종료 2 (expiresAt = 7일 전)
  await createChatRoom(
    me.id, partner3.id, MESSAGES_ROOM3,
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '종료2 (하은)',
  );

  console.log('\n=== 채팅 시드 완료 ===');
  console.log('로그인: POST /api/user/local-login { "username": "localtest", "password": "test1234" }');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
