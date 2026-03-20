/**
 * 더미 유저 40명 시드 스크립트
 * - 1:1 매칭용 20명 (남10 여10): ONE_TO_ONE 퀴즈 완료 + 매칭 요청/수락/채팅
 * - 그룹 매칭용 20명: GROUP 퀴즈 완료 + 그룹 채팅 참여
 *
 * 실행: npx ts-node -r tsconfig-paths/register prisma/seed/dummy-users.seed.ts
 */

import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { WeekCalculator } from './utils/week-calculator';

const prisma = new PrismaClient();

// ────────────────────────────────────────
// 1:1 유저 20명 (남 10, 여 10, 25~30대)
// ────────────────────────────────────────
const ONE_TO_ONE_USERS = [
  // 남성 10명
  { name: '김민준', nickname: '민준이형', gender: 'MALE',   age: 25, phoneNumber: '01033330001' },
  { name: '이도현', nickname: '도현킹',   gender: 'MALE',   age: 25, phoneNumber: '01033330002' },
  { name: '박준서', nickname: '준서베',   gender: 'MALE',   age: 25, phoneNumber: '01033330003' },
  { name: '최지훈', nickname: '지훈맨',   gender: 'MALE',   age: 30, phoneNumber: '01033330004' },
  { name: '정우진', nickname: '우진이',   gender: 'MALE',   age: 30, phoneNumber: '01033330005' },
  { name: '강현우', nickname: '현우베',   gender: 'MALE',   age: 30, phoneNumber: '01033330006' },
  { name: '조성민', nickname: '성민킹',   gender: 'MALE',   age: 25, phoneNumber: '01033330007' },
  { name: '윤태양', nickname: '태양맨',   gender: 'MALE',   age: 30, phoneNumber: '01033330008' },
  { name: '장하준', nickname: '하준이',   gender: 'MALE',   age: 25, phoneNumber: '01033330009' },
  { name: '임재원', nickname: '재원베',   gender: 'MALE',   age: 30, phoneNumber: '01033330010' },
  // 여성 10명
  { name: '이서연', nickname: '서연쓰',   gender: 'FEMALE', age: 25, phoneNumber: '01033330011' },
  { name: '김지아', nickname: '지아야',   gender: 'FEMALE', age: 25, phoneNumber: '01033330012' },
  { name: '박소율', nickname: '소율이',   gender: 'FEMALE', age: 25, phoneNumber: '01033330013' },
  { name: '최유나', nickname: '유나맘',   gender: 'FEMALE', age: 30, phoneNumber: '01033330014' },
  { name: '정하은', nickname: '하은쓰',   gender: 'FEMALE', age: 30, phoneNumber: '01033330015' },
  { name: '강나린', nickname: '나린이',   gender: 'FEMALE', age: 25, phoneNumber: '01033330016' },
  { name: '조채원', nickname: '채원다',   gender: 'FEMALE', age: 30, phoneNumber: '01033330017' },
  { name: '윤아영', nickname: '아영쓰',   gender: 'FEMALE', age: 25, phoneNumber: '01033330018' },
  { name: '장수빈', nickname: '수빈이야', gender: 'FEMALE', age: 30, phoneNumber: '01033330019' },
  { name: '임다연', nickname: '다연쓰',   gender: 'FEMALE', age: 25, phoneNumber: '01033330020' },
];

// ────────────────────────────────────────
// 그룹 유저 20명 (남녀 혼성)
// ────────────────────────────────────────
const GROUP_USERS = [
  { name: '한동훈', nickname: '동훈맨',   gender: 'MALE',   age: 25, phoneNumber: '01044440001' },
  { name: '오준혁', nickname: '준혁킹',   gender: 'MALE',   age: 25, phoneNumber: '01044440002' },
  { name: '배태민', nickname: '태민베',   gender: 'MALE',   age: 30, phoneNumber: '01044440003' },
  { name: '신민재', nickname: '민재오빠', gender: 'MALE',   age: 30, phoneNumber: '01044440004' },
  { name: '류성준', nickname: '성준이',   gender: 'MALE',   age: 25, phoneNumber: '01044440005' },
  { name: '문도윤', nickname: '도윤킹',   gender: 'MALE',   age: 35, phoneNumber: '01044440006' },
  { name: '전세훈', nickname: '세훈베',   gender: 'MALE',   age: 35, phoneNumber: '01044440007' },
  { name: '고승우', nickname: '승우맨',   gender: 'MALE',   age: 25, phoneNumber: '01044440008' },
  { name: '노태준', nickname: '태준킹',   gender: 'MALE',   age: 30, phoneNumber: '01044440009' },
  { name: '마현준', nickname: '현준이',   gender: 'MALE',   age: 25, phoneNumber: '01044440010' },
  { name: '한예슬', nickname: '예슬쓰',   gender: 'FEMALE', age: 25, phoneNumber: '01044440011' },
  { name: '오지현', nickname: '지현이야', gender: 'FEMALE', age: 25, phoneNumber: '01044440012' },
  { name: '배보라', nickname: '보라야',   gender: 'FEMALE', age: 30, phoneNumber: '01044440013' },
  { name: '신지은', nickname: '지은쓰',   gender: 'FEMALE', age: 30, phoneNumber: '01044440014' },
  { name: '류미래', nickname: '미래야',   gender: 'FEMALE', age: 35, phoneNumber: '01044440015' },
  { name: '문하늘', nickname: '하늘이',   gender: 'FEMALE', age: 25, phoneNumber: '01044440016' },
  { name: '전아린', nickname: '아린쓰',   gender: 'FEMALE', age: 30, phoneNumber: '01044440017' },
  { name: '고예은', nickname: '예은이닷', gender: 'FEMALE', age: 25, phoneNumber: '01044440018' },
  { name: '노민아', nickname: '민아야',   gender: 'FEMALE', age: 30, phoneNumber: '01044440019' },
  { name: '마지수', nickname: '지수야',   gender: 'FEMALE', age: 35, phoneNumber: '01044440020' },
];

const LOCATIONS = ['서울', '경기', '인천', '부산', '대구', '대전'];
const OCCUPATIONS = ['개발자', '디자이너', '마케터', '의사', '교사', '회계사', '금융', '학생', '프리랜서', '영업'];
const INTEREST_POOL = ['운동', '독서', '여행', '요리', '음악', '영화', '게임', '사진', '등산', '카페', '전시', '반려동물'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FEMALE_AVATARS = ['f1','f2','f3','f4','f5','f6','f7','f8'];
const MALE_AVATARS   = ['m1','m2','m3','m4','m5','m6','m7','m8'];

function randomAvatar(gender: string): string {
  const pool = gender === 'FEMALE' ? FEMALE_AVATARS : MALE_AVATARS;
  return `/assets/avatar/${randomFrom(pool)}.png`;
}

function randomInterests(): string[] {
  const shuffled = [...INTEREST_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 2);
}

const CHAT_MESSAGES = [
  '안녕하세요! 반갑습니다 😊',
  '퀴즈 답변이 비슷해서 신기했어요',
  '저도 그 선택 했어요!',
  '취미가 비슷한 것 같아서 좋네요',
  '어디 사세요?',
  '주말에 뭐 하세요?',
  '저는 주로 카페 가거나 영화 봐요',
  '좋아하는 음식 있으세요?',
  '한번 만나봐도 좋을 것 같아요',
  '오늘 날씨 좋죠?',
  '퀴즈 재밌었어요 ㅋㅋ',
  '이런 서비스 처음 써봐요',
  '생각보다 잘 맞는 것 같아요',
  '연락해요!',
  '취미가 뭐예요?',
];

const GROUP_MESSAGES = [
  '안녕하세요 여러분!',
  '저도 방금 들어왔어요',
  '반갑습니다~',
  '몇 명이나 계세요?',
  '퀴즈 재밌었죠?',
  '저는 서울 살아요',
  '오늘 뭐 하세요?',
  '여기 분위기 좋네요 ㅋㅋ',
  '다들 어떤 취미 있으세요?',
  '저는 운동 좋아해요',
  '영화 좋아하시는 분?',
  '주말에 모임 어때요?',
  '여기서 친구 사귀고 싶어요',
  '잘 부탁드려요!',
  '즐거운 대화 해요~',
  '퀴즈 결과 신기하더라고요',
  '비슷한 취향인 것 같아서 반가워요',
  '저도 그 선택 했는데!',
  '어떻게 이 서비스 알게 됐어요?',
  '앞으로 자주 얘기해요',
];

async function createOrGetUser(userData: (typeof ONE_TO_ONE_USERS)[0], roleId: number) {
  let user = await prisma.user.findUnique({ where: { phoneNumber: userData.phoneNumber } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: userData.name,
        nickname: userData.nickname,
        phoneNumber: userData.phoneNumber,
        gender: userData.gender,
        age: userData.age,
        roleId,
        socialAccounts: {
          create: {
            provider: 'test',
            providerUserId: `dummy_${userData.phoneNumber}`,
          },
        },
        profile: {
          create: {
            introduction: `안녕하세요, ${userData.nickname}입니다!`,
            location: randomFrom(LOCATIONS),
            occupation: randomFrom(OCCUPATIONS),
            interests: randomInterests(),
            preferredMinAge: 20,
            preferredMaxAge: 39,
            profileImageUrl: randomAvatar(userData.gender),
          },
        },
      },
    });
    console.log(`  ✅ 유저 생성: ${user.nickname}`);
  } else {
    console.log(`  ⏭️  기존 유저: ${user.nickname}`);
  }

  return user;
}

async function completeQuiz(
  userId: string,
  quizSet: { id: string; year: number; month: number; week: number; quizzes: { id: string; choices: { id: string }[] }[] },
) {
  const { year, month, week } = quizSet;

  const existing = await prisma.userQuizProgress.findUnique({
    where: { userId_year_month_week: { userId, year, month, week } },
  });

  if (existing?.status === 'COMPLETED') return;

  // 퀴즈 답변 저장
  for (const quiz of quizSet.quizzes) {
    const existingAnswer = await prisma.quizAnswer.findFirst({ where: { userId, quizId: quiz.id } });
    if (!existingAnswer) {
      const randomChoice = quiz.choices[Math.floor(Math.random() * quiz.choices.length)];
      await prisma.quizAnswer.create({
        data: { userId, quizId: quiz.id, choiceId: randomChoice.id },
      });
    }
  }

  // 진행 상태 COMPLETED로 저장
  await prisma.userQuizProgress.upsert({
    where: { userId_year_month_week: { userId, year, month, week } },
    update: { status: 'COMPLETED', completedAt: new Date(), quizSetId: quizSet.id },
    create: {
      userId,
      year,
      month,
      week,
      quizSetId: quizSet.id,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });
}

async function getQuizAnswers(userId: string, quizSetId: string) {
  return prisma.quizAnswer.findMany({
    where: { userId, quiz: { quizSetId } },
    include: { choice: true },
  });
}

function calcScore(
  answersA: { quizId: string; choiceId: string }[],
  answersB: { quizId: string; choiceId: string }[],
): number {
  const mapB = new Map(answersB.map(a => [a.quizId, a.choiceId]));
  const matched = answersA.filter(a => mapB.get(a.quizId) === a.choiceId).length;
  return Math.round((matched / answersA.length) * 100);
}

async function main() {
  console.log('=== 더미 데이터 시드 시작 ===\n');

  // 1. USER 롤 확인
  const userRole = await prisma.role.findFirst({ where: { code: 'USER' } });
  if (!userRole) throw new Error('USER role not found. Run main seed first.');

  // 2. 현재 주차 계산 (Redis 기준 → 없으면 KST 계산)
  let year: number, month: number, week: number;
  try {
    const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    const [ry, rm, rw] = await Promise.all([
      redis.get('system:current_year'),
      redis.get('system:current_month'),
      redis.get('system:current_week'),
    ]);
    redis.disconnect();
    if (ry && rm && rw) {
      year = Number(ry); month = Number(rm); week = Number(rw);
      console.log(`현재 주차 (Redis): ${year}년 ${month}월 ${week}주차\n`);
    } else {
      throw new Error('Redis 값 없음');
    }
  } catch {
    const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
    ({ year, month, week } = WeekCalculator.calculateYearMonthWeek(kstNow));
    console.log(`현재 주차 (KST 계산): ${year}년 ${month}월 ${week}주차\n`);
  }

  const startDate = WeekCalculator.getWeekStartDate(year, month, week);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  // ──────────────────────────────────────────────
  // 3. ONE_TO_ONE 퀴즈셋 확보
  // ──────────────────────────────────────────────
  console.log('--- 1:1 퀴즈셋 준비 ---');
  let oneToOneSet = await prisma.quizSet.findFirst({
    where: { year, month, week, matchingType: 'ONE_TO_ONE', isActive: true },
    include: { quizzes: { include: { choices: true } } },
  });

  if (!oneToOneSet) {
    console.log('ONE_TO_ONE 퀴즈셋이 없어 새로 생성합니다...');
    const created = await prisma.quizSet.create({
      data: {
        id: crypto.randomUUID(),
        year, month, week,
        category: '연애',
        title: `${year}년 ${month}월 ${week}주차 연애 퀴즈`,
        description: '연애에 관한 밸런스게임 퀴즈입니다.',
        startDate, endDate,
        isActive: true,
        matchingType: 'ONE_TO_ONE',
        quizzes: {
          create: Array.from({ length: 12 }, (_, i) => ({
            id: crypto.randomUUID(),
            question: [
              '이상적인 데이트 장소는?', '선호하는 연인 타입은?', '가장 로맨틱한 상황은?',
              '가장 중요한 연애 요소는?', '선호하는 연애 스타일은?', '가장 좋아하는 고백 방식은?',
              '가장 중요한 커플 활동은?', '가장 좋아하는 선물은?', '가장 중요한 대화 주제는?',
              '가장 좋아하는 기념일 방식은?', '가장 중요한 연애 가치관은?', '가장 좋아하는 연인과의 시간은?',
            ][i],
            order: i + 1,
            choices: {
              create: [
                { id: crypto.randomUUID(), text: ['카페', '영화관', '놀이공원', '야경 명소', '집', '공원', '미술관', '여행지', '일상', '서프라이즈', '신뢰', '함께하는 시간'][i], order: 1 },
                { id: crypto.randomUUID(), text: ['야외', '실내', '홈데이트', '액티비티', '조용한 곳', '활동적인 곳', '낭만적인 장소', '맛집', '특별한 날', '평소에도', '자유', '개인 시간'][i], order: 2 },
              ],
            },
          })),
        },
      },
      include: { quizzes: { include: { choices: true } } },
    });
    oneToOneSet = created;
    console.log(`  ✅ ONE_TO_ONE 퀴즈셋 생성: ${oneToOneSet.title}`);
  } else {
    console.log(`  ✅ 기존 ONE_TO_ONE 퀴즈셋 사용: ${oneToOneSet.title}`);
  }

  // ──────────────────────────────────────────────
  // 4. GROUP 퀴즈셋 확보
  // ──────────────────────────────────────────────
  console.log('\n--- 그룹 퀴즈셋 준비 ---');
  let groupSet = await prisma.quizSet.findFirst({
    where: { year, month, week, matchingType: 'GROUP', isActive: true },
    include: { quizzes: { include: { choices: true } } },
  });

  if (!groupSet) {
    console.log('GROUP 퀴즈셋이 없어 새로 생성합니다...');
    // 이미 사용 중인 카테고리 확인 후 미사용 카테고리 선택
    const usedCategories = await prisma.quizSet.findMany({
      where: { year, month, week },
      select: { category: true },
    });
    const usedCategorySet = new Set(usedCategories.map(q => q.category));
    const allCategories = ['동물', '음식', '연애', '취미'];
    const groupCategory = allCategories.find(c => !usedCategorySet.has(c)) ?? '동물_그룹';

    const created = await prisma.quizSet.create({
      data: {
        id: crypto.randomUUID(),
        year, month, week,
        category: groupCategory,
        title: `${year}년 ${month}월 ${week}주차 ${groupCategory} 그룹 퀴즈`,
        description: `${groupCategory}에 관한 밸런스게임 퀴즈입니다.`,
        startDate, endDate,
        isActive: true,
        matchingType: 'GROUP',
        quizzes: {
          create: Array.from({ length: 12 }, (_, i) => ({
            id: crypto.randomUUID(),
            question: [
              '가장 하고 싶은 취미는?', '가장 즐거운 취미는?', '가장 창의적인 취미는?',
              '가장 편안한 취미는?', '가장 사교적인 취미는?', '가장 도전적인 취미는?',
              '가장 건강한 취미는?', '가장 저렴한 취미는?', '가장 배우고 싶은 취미는?',
              '가장 힐링되는 취미는?', '가장 재미있는 취미는?', '가장 유익한 취미는?',
            ][i],
            order: i + 1,
            choices: {
              create: [
                { id: crypto.randomUUID(), text: ['등산', '독서', '그림', '음악', '요리', '운동', '러닝', '독서', '악기', '여행', '게임', '공부'][i], order: 1 },
                { id: crypto.randomUUID(), text: ['여행', '게임', '사진', '영화', '카페', '수영', '요가', '유튜브', '외국어', '집에서 쉬기', '친구 만나기', '새로운 경험'][i], order: 2 },
              ],
            },
          })),
        },
      },
      include: { quizzes: { include: { choices: true } } },
    });
    groupSet = created;
    console.log(`  ✅ GROUP 퀴즈셋 생성: ${groupSet.title}`);
  } else {
    console.log(`  ✅ 기존 GROUP 퀴즈셋 사용: ${groupSet.title}`);
  }

  // ──────────────────────────────────────────────
  // 5. 1:1 유저 20명 생성 + 퀴즈 완료
  // ──────────────────────────────────────────────
  console.log('\n--- 1:1 유저 생성 (20명) ---');
  const oneToOneUserIds: string[] = [];
  const oneToOneQuizSetWithYear = {
    ...oneToOneSet,
    year,
    month,
    week,
  };

  for (const userData of ONE_TO_ONE_USERS) {
    const user = await createOrGetUser(userData, userRole.id);
    await completeQuiz(user.id, oneToOneQuizSetWithYear);
    oneToOneUserIds.push(user.id);
  }

  // ──────────────────────────────────────────────
  // 6. 1:1 매칭 요청 생성 (남→여 페어링)
  //    - 남 10명, 여 10명을 페어링
  //    - 일부: ACCEPTED (채팅방 + 메시지)
  //    - 일부: PENDING
  //    - 일부: REJECTED
  // ──────────────────────────────────────────────
  console.log('\n--- 1:1 매칭 요청 생성 ---');

  const maleIds = oneToOneUserIds.slice(0, 10);   // 남성 10명
  const femaleIds = oneToOneUserIds.slice(10, 20); // 여성 10명

  // 매칭 상태 분포: 5쌍 ACCEPTED, 3쌍 PENDING, 2쌍 REJECTED
  const matchPlan: Array<{ mIdx: number; fIdx: number; status: 'ACCEPTED' | 'PENDING' | 'REJECTED' }> = [
    { mIdx: 0, fIdx: 0, status: 'ACCEPTED' },
    { mIdx: 1, fIdx: 1, status: 'ACCEPTED' },
    { mIdx: 2, fIdx: 2, status: 'ACCEPTED' },
    { mIdx: 3, fIdx: 3, status: 'ACCEPTED' },
    { mIdx: 4, fIdx: 4, status: 'ACCEPTED' },
    { mIdx: 5, fIdx: 5, status: 'PENDING' },
    { mIdx: 6, fIdx: 6, status: 'PENDING' },
    { mIdx: 7, fIdx: 7, status: 'PENDING' },
    { mIdx: 8, fIdx: 8, status: 'REJECTED' },
    { mIdx: 9, fIdx: 9, status: 'REJECTED' },
  ];

  for (const plan of matchPlan) {
    const fromUserId = maleIds[plan.mIdx];
    const toUserId = femaleIds[plan.fIdx];

    // 퀴즈 답변 기반 점수 계산
    const fromAnswers = await getQuizAnswers(fromUserId, oneToOneSet.id);
    const toAnswers = await getQuizAnswers(toUserId, oneToOneSet.id);
    const score = calcScore(fromAnswers, toAnswers);
    const matchedCount = fromAnswers.filter(a =>
      toAnswers.find(b => b.quizId === a.quizId && b.choiceId === a.choiceId)
    ).length;

    // 이미 매칭 요청이 있는지 확인
    const existingRequest = await prisma.matchRequest.findUnique({
      where: { quizSetId_fromUserId_toUserId: { quizSetId: oneToOneSet.id, fromUserId, toUserId } },
    });

    let matchRequest = existingRequest;

    if (!matchRequest) {
      matchRequest = await prisma.matchRequest.create({
        data: {
          quizSetId: oneToOneSet.id,
          fromUserId,
          toUserId,
          status: plan.status,
          score,
          scoreBreakdown: {
            quizMatchRate: score,
            matchedQuestions: matchedCount,
            totalQuestions: fromAnswers.length,
            reasons: [],
          },
          algorithmVersion: 'v1',
          respondedAt: plan.status !== 'PENDING' ? new Date() : null,
        },
      });
      console.log(`  ✅ 매칭 요청 생성: [${plan.status}] 점수 ${score}점`);
    } else {
      console.log(`  ⏭️  기존 매칭 요청 존재 (status: ${existingRequest.status})`);
    }

    // ACCEPTED인 경우 채팅방 + 메시지 생성
    if (plan.status === 'ACCEPTED' && matchRequest) {
      const existingRoom = await prisma.chatRoom.findUnique({
        where: { matchRequestId: matchRequest.id },
      });

      let room = existingRoom;

      if (!room) {
        room = await prisma.chatRoom.create({
          data: {
            matchRequestId: matchRequest.id,
            participants: {
              create: [
                { userId: fromUserId },
                { userId: toUserId },
              ],
            },
          },
        });
        console.log(`    💬 채팅방 생성`);
      }

      // 메시지 교환 (5~8개)
      const existingMsgCount = await prisma.chatMessage.count({ where: { roomId: room.id } });
      if (existingMsgCount === 0) {
        const msgCount = Math.floor(Math.random() * 4) + 5;
        const participants = [fromUserId, toUserId];
        const msgs = CHAT_MESSAGES.sort(() => 0.5 - Math.random()).slice(0, msgCount);

        let createdAt = new Date(Date.now() - msgCount * 60 * 1000);
        for (let i = 0; i < msgs.length; i++) {
          const senderId = participants[i % 2];
          createdAt = new Date(createdAt.getTime() + 60 * 1000);
          await prisma.chatMessage.create({
            data: {
              roomId: room.id,
              senderId,
              content: msgs[i],
              createdAt,
            },
          });
        }
        console.log(`    💬 메시지 ${msgs.length}개 생성`);
      }
    }
  }

  // ──────────────────────────────────────────────
  // 7. 그룹 유저 20명 생성 + 퀴즈 완료 + 그룹 채팅 참여
  // ──────────────────────────────────────────────
  console.log('\n--- 그룹 유저 생성 (20명) ---');
  const groupUserIds: string[] = [];
  const groupQuizSetWithYear = { ...groupSet, year, month, week };

  for (const userData of GROUP_USERS) {
    const user = await createOrGetUser(userData, userRole.id);
    await completeQuiz(user.id, groupQuizSetWithYear);
    groupUserIds.push(user.id);
  }

  // 그룹 채팅방 생성/참여
  console.log('\n--- 그룹 채팅방 생성 ---');
  let groupRoom = await prisma.chatRoom.findUnique({
    where: { quizSetId: groupSet.id },
  });

  if (!groupRoom) {
    groupRoom = await prisma.chatRoom.create({
      data: { quizSetId: groupSet.id },
    });
    console.log(`  ✅ 그룹 채팅방 생성`);
  } else {
    console.log(`  ⏭️  기존 그룹 채팅방 사용`);
  }

  // 참여자 추가
  let addedCount = 0;
  for (const userId of groupUserIds) {
    const existing = await prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId: groupRoom.id, userId } },
    });
    if (!existing) {
      await prisma.chatParticipant.create({
        data: { roomId: groupRoom.id, userId },
      });
      addedCount++;
    }
  }
  console.log(`  ✅ 그룹 채팅 참여자 ${addedCount}명 추가`);

  // 그룹 채팅 메시지 생성
  const existingGroupMsgCount = await prisma.chatMessage.count({ where: { roomId: groupRoom.id } });
  if (existingGroupMsgCount === 0) {
    const msgs = [...GROUP_MESSAGES].sort(() => 0.5 - Math.random()).slice(0, 20);
    let createdAt = new Date(Date.now() - msgs.length * 3 * 60 * 1000);

    for (let i = 0; i < msgs.length; i++) {
      const senderId = groupUserIds[i % groupUserIds.length];
      createdAt = new Date(createdAt.getTime() + 3 * 60 * 1000);
      await prisma.chatMessage.create({
        data: {
          roomId: groupRoom.id,
          senderId,
          content: msgs[i],
          createdAt,
        },
      });
    }
    console.log(`  💬 그룹 채팅 메시지 ${msgs.length}개 생성`);
  }

  // ──────────────────────────────────────────────
  // 8. 최종 요약
  // ──────────────────────────────────────────────
  const totalUsers = await prisma.user.count({ where: { role: { code: 'USER' } } });
  const totalProgress = await prisma.userQuizProgress.count({ where: { year, month, week, status: 'COMPLETED' } });
  const totalMatchRequests = await prisma.matchRequest.count();
  const totalChatRooms = await prisma.chatRoom.count();
  const totalMessages = await prisma.chatMessage.count();
  const groupParticipants = await prisma.chatParticipant.count({ where: { roomId: groupRoom.id } });

  console.log('\n=== 시드 완료 ===');
  console.log(`총 USER 수: ${totalUsers}명`);
  console.log(`현재 주차 퀴즈 완료: ${totalProgress}명`);
  console.log(`매칭 요청 총계: ${totalMatchRequests}건`);
  console.log(`채팅방 수: ${totalChatRooms}개 (그룹 채팅 참여자 ${groupParticipants}명)`);
  console.log(`총 메시지 수: ${totalMessages}개`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
