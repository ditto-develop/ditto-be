import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { CATEGORIES, QUIZ_CHOICES, QUIZ_QUESTIONS } from './data/quiz-data';
import { randomInt, shuffleArray } from './utils/random.util';
import { WeekCalculator } from './utils/week-calculator';

interface WeekInfo {
  year: number;
  month: number;
  week: number;
}

function getNextSevenWeeks(fromDate: Date): WeekInfo[] {
  const { year, month, week } = WeekCalculator.calculateYearMonthWeek(fromDate);
  let currentYear = year;
  let currentMonth = month;
  let currentWeek = week; // 현재 주차부터 시작

  const weeks: WeekInfo[] = [];

  for (let i = 0; i < 7; i++) {
    // 월별 주차 수 확인
    const monthWeeks = WeekCalculator.getWeeksInMonth(currentYear, currentMonth).length;

    // 월 경계 처리
    if (currentWeek > monthWeeks) {
      currentWeek = 1;
      currentMonth += 1;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear += 1;
      }
    }

    weeks.push({ year: currentYear, month: currentMonth, week: currentWeek });
    currentWeek += 1;
  }

  return weeks;
}

export async function seedQuizSets(prisma: PrismaClient): Promise<void> {
  console.log('[seed] 퀴즈 세트 및 퀴즈 생성 시작');

  const targetWeeks = getNextSevenWeeks(new Date());

  for (const { year, month, week } of targetWeeks) {
    console.log(`[seed] 생성 대상 주차: ${year}년 ${month}월 ${week}주차`);

    // 해당 주차에 이미 퀴즈 세트가 있는지 확인
    const existingQuizSet = await prisma.quizSet.findFirst({
      where: { year, month, week },
    });

    if (existingQuizSet) {
      console.log(`[seed] 이미 퀴즈 세트가 존재하여 스킵: ${year}년 ${month}월 ${week}주차`);
      continue;
    }

    // 한 주에 2~4개의 퀴즈 세트 생성 (랜덤)
    const quizSetCount = randomInt(2, 4);

    // 카테고리 셔플하여 중복 없이 선택
    const selectedCategories = shuffleArray(CATEGORIES).slice(0, quizSetCount);

    for (const category of selectedCategories) {
      const startDate = WeekCalculator.getWeekStartDate(year, month, week);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      const quizSet = await prisma.quizSet.create({
        data: {
          id: crypto.randomUUID(),
          year,
          month,
          week,
          category,
          title: `${year}년 ${month}월 ${week}주차 ${category} 퀴즈`,
          description: `${category}에 관한 재미있는 퀴즈 세트입니다.`,
          startDate,
          endDate,
          isActive: true,
        },
      });

      console.log(`[seed] 퀴즈 세트 생성: ${quizSet.title}`);

      const questions = QUIZ_QUESTIONS[category];
      const choices = QUIZ_CHOICES[category];

      for (let idx = 0; idx < 12; idx++) {
        const quiz = await prisma.quiz.create({
          data: {
            id: crypto.randomUUID(),
            question: questions[idx],
            order: idx + 1,
            quizSetId: quizSet.id,
          },
        });

        // 4개 후보 중 2개를 무작위로 선택 (밸런스게임용)
        const selectedChoices = shuffleArray(choices[idx]).slice(0, 2);
        for (let cIdx = 0; cIdx < 2; cIdx++) {
          await prisma.choice.create({
            data: {
              id: crypto.randomUUID(),
              text: selectedChoices[cIdx],
              quizId: quiz.id,
              order: cIdx + 1,
            },
          });
        }
      }

      console.log(`[seed] ${quizSet.title}에 12개의 퀴즈 생성 완료`);
    }
  }

  console.log('[seed] 퀴즈 세트 및 퀴즈 생성 완료');
}

