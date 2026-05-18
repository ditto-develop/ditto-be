/**
 * 그룹채팅-투표 시스템 테스트용 시드
 * - 오준서(hunseol03@naver.com, kakao) + localtest 두 명만 있는 그룹 채팅방 생성
 * - 전용 테스트 QuizSet(GROUP) 생성/재사용
 *
 * 실행:
 *   cd ditto-be && npx ts-node -r tsconfig-paths/register prisma/seed/test-group-chat.seed.ts
 */

import { PrismaClient, MatchingType, ChatRoomStatus, QuizProgressStatus } from '@prisma/client';

const prisma = new PrismaClient();

const OJUNSEO_EMAIL = 'hunseol03@naver.com';
const LOCAL_USERNAME = 'localtest';

const TEST_QUIZ_SET = {
  year: 2099,
  month: 12,
  week: 1,
  category: '테스트',
  title: '[TEST] 그룹채팅-투표 테스트 퀴즈',
  description: '그룹채팅+투표 시스템 테스트 전용',
};

async function main() {
  console.log('=== 테스트 그룹 채팅방 시드 시작 ===');

  const ojunseo = await prisma.user.findFirst({ where: { email: OJUNSEO_EMAIL } });
  if (!ojunseo) throw new Error(`오준서 계정(${OJUNSEO_EMAIL})이 없습니다.`);
  const localtest = await prisma.user.findFirst({ where: { username: LOCAL_USERNAME } });
  if (!localtest) throw new Error(`localtest 계정이 없습니다. local-test-user.seed.ts 먼저 실행하세요.`);

  const userRole = await prisma.role.findFirst({ where: { code: 'USER' } });
  if (!userRole) throw new Error('USER role not found. Run main seed first.');

  const allParticipants = [ojunseo, localtest];
  console.log(`참가자 ${allParticipants.length}명:`);
  allParticipants.forEach((u, i) => console.log(`  ${i + 1}. ${u.name} (${u.nickname}) — ${u.id}`));

  const now = new Date();
  const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const quizSet = await prisma.quizSet.upsert({
    where: {
      year_month_week_category: {
        year: TEST_QUIZ_SET.year,
        month: TEST_QUIZ_SET.month,
        week: TEST_QUIZ_SET.week,
        category: TEST_QUIZ_SET.category,
      },
    },
    update: { isActive: true, matchingType: MatchingType.GROUP, startDate, endDate },
    create: {
      year: TEST_QUIZ_SET.year,
      month: TEST_QUIZ_SET.month,
      week: TEST_QUIZ_SET.week,
      category: TEST_QUIZ_SET.category,
      title: TEST_QUIZ_SET.title,
      description: TEST_QUIZ_SET.description,
      startDate,
      endDate,
      isActive: true,
      matchingType: MatchingType.GROUP,
    },
  });
  console.log(`QuizSet: ${quizSet.id}`);

  const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  const existingRoom = await prisma.chatRoom.findUnique({ where: { quizSetId: quizSet.id } });
  let room;
  if (existingRoom) {
    room = await prisma.chatRoom.update({
      where: { id: existingRoom.id },
      data: {
        status: ChatRoomStatus.ACTIVE,
        expiresAt,
        endedAt: null,
        endedByUserId: null,
        endedReason: null,
      },
    });
    console.log(`기존 채팅방 재사용: ${room.id}`);
  } else {
    room = await prisma.chatRoom.create({
      data: {
        quizSetId: quizSet.id,
        status: ChatRoomStatus.ACTIVE,
        expiresAt,
      },
    });
    console.log(`새 채팅방 생성: ${room.id}`);
  }

  const targetUserIds = allParticipants.map(u => u.id);
  const removed = await prisma.chatParticipant.deleteMany({
    where: { roomId: room.id, userId: { notIn: targetUserIds } },
  });
  if (removed.count > 0) {
    console.log(`기존 참가자 중 타겟 외 ${removed.count}명 제거`);
  }

  for (const user of allParticipants) {
    await prisma.chatParticipant.upsert({
      where: { roomId_userId: { roomId: room.id, userId: user.id } },
      update: {},
      create: { roomId: room.id, userId: user.id },
    });

    await prisma.userQuizProgress.upsert({
      where: {
        userId_year_month_week: {
          userId: user.id,
          year: quizSet.year,
          month: quizSet.month,
          week: quizSet.week,
        },
      },
      update: {
        quizSetId: quizSet.id,
        status: QuizProgressStatus.COMPLETED,
        groupDeclined: false,
        completedAt: now,
      },
      create: {
        userId: user.id,
        quizSetId: quizSet.id,
        year: quizSet.year,
        month: quizSet.month,
        week: quizSet.week,
        status: QuizProgressStatus.COMPLETED,
        completedAt: now,
      },
    });
  }

  const existingWelcome = await prisma.chatMessage.findFirst({
    where: { roomId: room.id, type: 'SYSTEM' },
  });
  if (!existingWelcome) {
    await prisma.chatMessage.create({
      data: {
        roomId: room.id,
        senderId: null,
        type: 'SYSTEM',
        content: '[TEST] 그룹 채팅방이 열렸어요. 투표를 만들어볼까요?',
      },
    });
  }

  console.log('');
  console.log('=== 완료 ===');
  console.log(`roomId: ${room.id}`);
  console.log(`quizSetId: ${quizSet.id}`);
  console.log(`만료: ${expiresAt.toISOString()}`);
  console.log(`참가자 수: ${allParticipants.length}명`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
