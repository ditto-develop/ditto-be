import { PrismaClient } from '@prisma/client';
import { WeekCalculator } from './src/modules/quiz/domain/utils/week-calculator.util';

const prisma = new PrismaClient();

async function migrate() {
  console.log('데이터 마이그레이션 시작...');

  // 1. QuizSet 마이그레이션
  const quizSets = await prisma.quizSet.findMany();
  console.log(`${quizSets.length}개의 QuizSet 처리 중...`);

  for (const quizSet of quizSets) {
    // 시작일(startDate)을 기준으로 새로운 년, 월, 주차 계산
    const { year, month, week } = WeekCalculator.calculateYearMonthWeek(quizSet.startDate);
    
    await prisma.quizSet.update({
      where: { id: quizSet.id },
      data: {
        year,
        month,
        week,
      },
    });
  }

  // 2. UserQuizProgress 마이그레이션
  const progresses = await prisma.userQuizProgress.findMany({
    include: { quizSet: true },
  });
  console.log(`${progresses.length}개의 UserQuizProgress 처리 중...`);

  for (const progress of progresses) {
    // 연결된 QuizSet의 정보를 따라감
    await prisma.userQuizProgress.update({
      where: { id: progress.id },
      data: {
        year: progress.quizSet.year,
        month: progress.quizSet.month,
        week: progress.quizSet.week,
      },
    });
  }

  // 3. Choice.order 마이그레이션 (1,2 → 0,1)
  const choices = await prisma.choice.findMany();
  console.log(`${choices.length}개의 Choice 처리 중...`);

  for (const choice of choices) {
    let newOrder = choice.order;

    if (choice.order === 1) {
      newOrder = 0;
    } else if (choice.order === 2) {
      newOrder = 1;
    }

    if (newOrder !== choice.order) {
      await prisma.choice.update({
        where: { id: choice.id },
        data: { order: newOrder },
      });
    }
  }

  console.log('데이터 마이그레이션 완료!');
}

migrate()
  .catch((e) => {
    console.error('마이그레이션 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

