/**
 * 현재 주차 퀴즈셋의 matchingType을 변경하는 스크립트
 * - ONE_TO_ONE ↔ GROUP 토글
 *
 * 실행:
 *   그룹으로 변경: npx ts-node -r tsconfig-paths/register prisma/seed/test-switch-matching-type.seed.ts group
 *   1대1로 변경:   npx ts-node -r tsconfig-paths/register prisma/seed/test-switch-matching-type.seed.ts 1on1
 */

import { PrismaClient } from '@prisma/client';
import { WeekCalculator } from './utils/week-calculator';

const prisma = new PrismaClient();

async function main() {
  const arg = process.argv[2];
  const targetType = arg === '1on1' ? 'ONE_TO_ONE' : 'GROUP';

  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const { year, month, week } = WeekCalculator.calculateYearMonthWeek(kstNow);

  console.log(`=== 현재 주차 퀴즈셋 matchingType → ${targetType} ===`);
  console.log(`대상: ${year}년 ${month}월 ${week}주차`);

  const quizSets = await prisma.quizSet.findMany({
    where: { year, month, week, isActive: true },
  });

  if (quizSets.length === 0) {
    console.error('❌ 현재 주차 퀴즈셋이 없습니다. 먼저 seed.ts를 실행해주세요.');
    return;
  }

  for (const qs of quizSets) {
    await prisma.quizSet.update({
      where: { id: qs.id },
      data: { matchingType: targetType },
    });
    console.log(`✅ ${qs.category} (${qs.id.slice(0, 8)}) → ${targetType}`);
  }

  console.log('\n완료!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
