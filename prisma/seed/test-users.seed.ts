/**
 * 테스트용 가짜 유저 시드 스크립트
 * - 현재 주차 퀴즈셋을 찾아 40명의 유저가 퀴즈를 완료한 상태로 세팅
 * - 랜덤 답변으로 매칭 테스트 가능
 *
 * 실행: npx ts-node -r tsconfig-paths/register prisma/seed/test-users.seed.ts
 */

import { PrismaClient } from '@prisma/client';
import { WeekCalculator } from './utils/week-calculator';

const prisma = new PrismaClient();

const FAKE_USERS = [
  // 기존 10명
  { name: '김민준', nickname: '민준이', gender: 'MALE', age: 25, phoneNumber: '01011110001' },
  { name: '이서연', nickname: '서연쓰', gender: 'FEMALE', age: 24, phoneNumber: '01011110002' },
  { name: '박지호', nickname: '지호야', gender: 'MALE', age: 27, phoneNumber: '01011110003' },
  { name: '최유나', nickname: '유나맘', gender: 'FEMALE', age: 26, phoneNumber: '01011110004' },
  { name: '정도윤', nickname: '도윤킹', gender: 'MALE', age: 28, phoneNumber: '01011110005' },
  { name: '강하은', nickname: '하은이닷', gender: 'FEMALE', age: 23, phoneNumber: '01011110006' },
  { name: '조현우', nickname: '현우베', gender: 'MALE', age: 29, phoneNumber: '01011110007' },
  { name: '윤지아', nickname: '지아야', gender: 'FEMALE', age: 25, phoneNumber: '01011110008' },
  { name: '임태양', nickname: '태양이', gender: 'MALE', age: 26, phoneNumber: '01011110009' },
  { name: '한소율', nickname: '소율좋아', gender: 'FEMALE', age: 27, phoneNumber: '01011110010' },
  // 추가 30명
  { name: '오준혁', nickname: '준혁맨', gender: 'MALE', age: 22, phoneNumber: '01011110011' },
  { name: '배나린', nickname: '나린이', gender: 'FEMALE', age: 21, phoneNumber: '01011110012' },
  { name: '신동현', nickname: '동현킹', gender: 'MALE', age: 30, phoneNumber: '01011110013' },
  { name: '류채원', nickname: '채원이다', gender: 'FEMALE', age: 29, phoneNumber: '01011110014' },
  { name: '황준서', nickname: '준서야', gender: 'MALE', age: 24, phoneNumber: '01011110015' },
  { name: '송지은', nickname: '지은쓰', gender: 'FEMALE', age: 23, phoneNumber: '01011110016' },
  { name: '안재원', nickname: '재원베', gender: 'MALE', age: 31, phoneNumber: '01011110017' },
  { name: '남수빈', nickname: '수빈이야', gender: 'FEMALE', age: 28, phoneNumber: '01011110018' },
  { name: '고태준', nickname: '태준킹', gender: 'MALE', age: 26, phoneNumber: '01011110019' },
  { name: '문하늘', nickname: '하늘이', gender: 'FEMALE', age: 22, phoneNumber: '01011110020' },
  { name: '전민재', nickname: '민재오빠', gender: 'MALE', age: 33, phoneNumber: '01011110021' },
  { name: '서예은', nickname: '예은이닷', gender: 'FEMALE', age: 31, phoneNumber: '01011110022' },
  { name: '유성준', nickname: '성준이', gender: 'MALE', age: 27, phoneNumber: '01011110023' },
  { name: '권아영', nickname: '아영쓰', gender: 'FEMALE', age: 26, phoneNumber: '01011110024' },
  { name: '차민수', nickname: '민수베', gender: 'MALE', age: 20, phoneNumber: '01011110025' },
  { name: '노지현', nickname: '지현이야', gender: 'FEMALE', age: 20, phoneNumber: '01011110026' },
  { name: '홍기준', nickname: '기준킹', gender: 'MALE', age: 35, phoneNumber: '01011110027' },
  { name: '마유진', nickname: '유진이', gender: 'FEMALE', age: 34, phoneNumber: '01011110028' },
  { name: '김도훈', nickname: '도훈맨', gender: 'MALE', age: 23, phoneNumber: '01011110029' },
  { name: '이민아', nickname: '민아야', gender: 'FEMALE', age: 24, phoneNumber: '01011110030' },
  { name: '박성현', nickname: '성현이', gender: 'MALE', age: 32, phoneNumber: '01011110031' },
  { name: '최다연', nickname: '다연쓰', gender: 'FEMALE', age: 30, phoneNumber: '01011110032' },
  { name: '정우진', nickname: '우진킹', gender: 'MALE', age: 21, phoneNumber: '01011110033' },
  { name: '강보라', nickname: '보라야', gender: 'FEMALE', age: 22, phoneNumber: '01011110034' },
  { name: '조세훈', nickname: '세훈베', gender: 'MALE', age: 28, phoneNumber: '01011110035' },
  { name: '윤미래', nickname: '미래야', gender: 'FEMALE', age: 27, phoneNumber: '01011110036' },
  { name: '임현준', nickname: '현준이', gender: 'MALE', age: 34, phoneNumber: '01011110037' },
  { name: '한예슬', nickname: '예슬쓰', gender: 'FEMALE', age: 33, phoneNumber: '01011110038' },
  { name: '오지훈', nickname: '지훈맨', gender: 'MALE', age: 29, phoneNumber: '01011110039' },
  { name: '배수아', nickname: '수아야', gender: 'FEMALE', age: 25, phoneNumber: '01011110040' },
];

async function main() {
  console.log('=== 테스트 유저 시드 시작 ===');

  // 1. USER 롤 확인
  const userRole = await prisma.role.findFirst({ where: { code: 'USER' } });
  if (!userRole) throw new Error('USER role not found. Run main seed first.');

  // 2. 현재 KST 주차 계산
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const { year, month, week } = WeekCalculator.calculateYearMonthWeek(kstNow);
  console.log(`현재 주차: ${year}년 ${month}월 ${week}주차`);

  // 3. 현재 주차 퀴즈셋 조회
  const quizSets = await prisma.quizSet.findMany({
    where: { year, month, week, isActive: true },
    include: { quizzes: { include: { choices: true } } },
  });

  if (quizSets.length === 0) {
    console.error(`❌ ${year}년 ${month}월 ${week}주차 퀴즈셋이 없습니다.`);
    console.error('먼저 quiz seed를 실행해주세요: npx ts-node prisma/seed/seed.ts');
    return;
  }

  console.log(`퀴즈셋 ${quizSets.length}개 발견:`, quizSets.map(q => `${q.category}(${q.id.slice(0, 8)})`).join(', '));

  // 4. 각 유저 생성 + 퀴즈 완료 처리
  for (const userData of FAKE_USERS) {
    // 기존 유저 확인 (phoneNumber unique)
    let user = await prisma.user.findUnique({ where: { phoneNumber: userData.phoneNumber } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userData.name,
          nickname: userData.nickname,
          phoneNumber: userData.phoneNumber,
          gender: userData.gender,
          age: userData.age,
          roleId: userRole.id,
          socialAccounts: {
            create: {
              provider: 'test',
              providerUserId: `test_${userData.phoneNumber}`,
            },
          },
          profile: {
            create: {
              introduction: `안녕하세요, ${userData.nickname}입니다!`,
              location: ['서울', '경기', '인천', '부산'][Math.floor(Math.random() * 4)],
            },
          },
        },
      });
      console.log(`✅ 유저 생성: ${user.nickname} (${user.id.slice(0, 8)})`);
    } else {
      console.log(`⏭️  유저 기존 존재: ${user.nickname}`);
    }

    // 5. 각 퀴즈셋에 대해 퀴즈 완료 처리
    for (const quizSet of quizSets) {
      // 이미 진행 기록이 있는지 확인
      const existingProgress = await prisma.userQuizProgress.findUnique({
        where: { userId_year_month_week: { userId: user.id, year, month, week } },
      });

      if (existingProgress?.status === 'COMPLETED') {
        console.log(`  ⏭️  이미 완료: ${quizSet.category}`);
        continue;
      }

      // 6. 랜덤 답변 생성
      const quizAnswerData = quizSet.quizzes.map(quiz => {
        const choices = quiz.choices;
        const randomChoice = choices[Math.floor(Math.random() * choices.length)];
        return {
          userId: user!.id,
          quizId: quiz.id,
          choiceId: randomChoice.id,
        };
      });

      // 7. 답변 저장 (기존 답변 있으면 skip)
      for (const answer of quizAnswerData) {
        const existing = await prisma.quizAnswer.findFirst({
          where: { userId: answer.userId, quizId: answer.quizId },
        });
        if (!existing) {
          await prisma.quizAnswer.create({ data: answer });
        }
      }

      // 8. UserQuizProgress COMPLETED로 설정
      await prisma.userQuizProgress.upsert({
        where: { userId_year_month_week: { userId: user.id, year, month, week } },
        update: { status: 'COMPLETED', completedAt: new Date(), quizSetId: quizSet.id },
        create: {
          userId: user.id,
          year,
          month,
          week,
          quizSetId: quizSet.id,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      console.log(`  ✅ 퀴즈 완료: ${quizSet.category} (${quizSet.quizzes.length}문제)`);
    }
  }

  // 9. 결과 요약
  const totalCompleted = await prisma.userQuizProgress.count({ where: { year, month, week, status: 'COMPLETED' } });
  console.log(`\n=== 완료 ===`);
  console.log(`현재 주차 퀴즈 완료 유저 수: ${totalCompleted}명`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
