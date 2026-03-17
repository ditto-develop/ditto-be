import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { MatchingType } from '@prisma/client';
import { PrismaService } from '@module/common/prisma/prisma.service';
import { SystemStateService } from '@module/quiz/infrastructure/services/system-state.service';
import { WeekCalculator } from '@module/quiz/domain/utils/week-calculator.util';
import { AdminSeedDummyResultDto } from '../dto/admin-seed-dummy.dto';

type QuizSetWithQuizzes = {
  id: string;
  quizzes: { id: string; choices: { id: string }[] }[];
};

// ─────────────────────────────────────────────
// 더미 유저 데이터 (1:1: 8남 7녀, GROUP: 8남 7녀)
// ─────────────────────────────────────────────
const ONE_TO_ONE_USERS = [
  // 남성 8명
  { name: '김민준', nickname: '민준이형', gender: 'MALE',   age: 25, phone: '01033330001' },
  { name: '이도현', nickname: '도현킹',   gender: 'MALE',   age: 27, phone: '01033330002' },
  { name: '박준서', nickname: '준서베',   gender: 'MALE',   age: 25, phone: '01033330003' },
  { name: '최지훈', nickname: '지훈맨',   gender: 'MALE',   age: 30, phone: '01033330004' },
  { name: '정우진', nickname: '우진이',   gender: 'MALE',   age: 28, phone: '01033330005' },
  { name: '강현우', nickname: '현우베',   gender: 'MALE',   age: 30, phone: '01033330006' },
  { name: '조성민', nickname: '성민킹',   gender: 'MALE',   age: 26, phone: '01033330007' },
  { name: '윤태양', nickname: '태양맨',   gender: 'MALE',   age: 29, phone: '01033330008' },
  // 여성 7명
  { name: '이서연', nickname: '서연쓰',   gender: 'FEMALE', age: 24, phone: '01033330011' },
  { name: '김지아', nickname: '지아야',   gender: 'FEMALE', age: 26, phone: '01033330012' },
  { name: '박소율', nickname: '소율이',   gender: 'FEMALE', age: 25, phone: '01033330013' },
  { name: '최유나', nickname: '유나맘',   gender: 'FEMALE', age: 29, phone: '01033330014' },
  { name: '정하은', nickname: '하은쓰',   gender: 'FEMALE', age: 28, phone: '01033330015' },
  { name: '강나린', nickname: '나린이',   gender: 'FEMALE', age: 25, phone: '01033330016' },
  { name: '조채원', nickname: '채원다',   gender: 'FEMALE', age: 27, phone: '01033330017' },
];

const GROUP_USERS = [
  // 남성 8명
  { name: '한동훈', nickname: '동훈맨',   gender: 'MALE',   age: 25, phone: '01044440001' },
  { name: '오준혁', nickname: '준혁킹',   gender: 'MALE',   age: 26, phone: '01044440002' },
  { name: '배태민', nickname: '태민베',   gender: 'MALE',   age: 30, phone: '01044440003' },
  { name: '신민재', nickname: '민재오빠', gender: 'MALE',   age: 28, phone: '01044440004' },
  { name: '류성준', nickname: '성준이',   gender: 'MALE',   age: 25, phone: '01044440005' },
  { name: '문도윤', nickname: '도윤킹',   gender: 'MALE',   age: 32, phone: '01044440006' },
  { name: '전세훈', nickname: '세훈베',   gender: 'MALE',   age: 33, phone: '01044440007' },
  { name: '고승우', nickname: '승우맨',   gender: 'MALE',   age: 27, phone: '01044440008' },
  // 여성 7명
  { name: '한예슬', nickname: '예슬쓰',   gender: 'FEMALE', age: 25, phone: '01044440011' },
  { name: '오지현', nickname: '지현이야', gender: 'FEMALE', age: 26, phone: '01044440012' },
  { name: '배보라', nickname: '보라야',   gender: 'FEMALE', age: 29, phone: '01044440013' },
  { name: '신지은', nickname: '지은쓰',   gender: 'FEMALE', age: 30, phone: '01044440014' },
  { name: '류미래', nickname: '미래야',   gender: 'FEMALE', age: 32, phone: '01044440015' },
  { name: '문하늘', nickname: '하늘이',   gender: 'FEMALE', age: 25, phone: '01044440016' },
  { name: '전아린', nickname: '아린쓰',   gender: 'FEMALE', age: 28, phone: '01044440017' },
];

const LOCATIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주'];
const OCCUPATIONS = ['개발자', '디자이너', '마케터', '의사', '교사', '회계사', '금융', '학생', '프리랜서', '영업'];
const INTEREST_POOL = ['운동', '독서', '여행', '요리', '음악', '영화', '게임', '사진', '등산', '카페', '전시', '반려동물'];

// 10개 소개 노트 질문에 대한 다양한 답변 풀
const INTRO_ANSWERS_POOL: string[][] = [
  // Q1: 여행갈 때 꼭 챙겨야 하는 3가지는?
  [
    '선글라스, 카메라, 여행 책자',
    '이어폰, 보조배터리, 스낵',
    '편한 신발, 카메라, 일기장',
    '여권, 충전기, 상비약',
    '스니커즈, 선크림, 이어폰',
  ],
  // Q2: 주말 아침 10시, 나는 주로 뭐하고 있을까?
  [
    '카페에서 커피 한 잔 하며 책 읽기',
    '늦잠 자다가 이제 막 일어남',
    '조깅하고 돌아와서 샤워 중',
    '유튜브 보면서 브런치 먹기',
    '친구한테 주말 약속 잡는 카톡 보내기',
  ],
  // Q3: 친구들이 나한테 제일 많이 하는 말은?
  [
    '너 왜 이렇게 웃겨ㅋㅋ',
    '진짜 한결같다',
    '너 없으면 심심해',
    '의외로 섬세하다',
    '어떻게 저런 생각을 하지',
  ],
  // Q4: 스트레스 받을 때 나만의 해소법은?
  [
    '드라이브 하면서 음악 크게 틀기',
    '맛있는 거 먹으러 가기',
    '집에서 영화 정주행',
    '헬스장 가서 운동하기',
    '혼자 카페 가서 멍 때리기',
  ],
  // Q5: 최근 1년 내 가장 잘한 선택은?
  [
    '직장 바꾼 것',
    '헬스 등록한 것',
    '여행 즉흥으로 떠난 것',
    '새 취미 시작한 것',
    '오래된 친구한테 먼저 연락한 것',
  ],
  // Q6: 나를 가장 행복하게 만드는 순간은?
  [
    '사랑하는 사람들과 맛있는 걸 먹을 때',
    '계획했던 일이 딱 맞아떨어질 때',
    '오랜 친구를 오랜만에 만날 때',
    '혼자 좋아하는 공간에 있을 때',
    '음악이 지금 내 감정에 딱 맞을 때',
  ],
  // Q7: 요즘 내가 가장 많이 쓰는 앱 3개는?
  [
    '카카오톡, 유튜브, 인스타그램',
    '스포티파이, 네이버지도, 카카오톡',
    '틱톡, 당근마켓, 카카오톡',
    '유튜브, 카카오톡, 네이버',
    '인스타그램, 카카오톡, 쿠팡',
  ],
  // Q8: 하루 중 가장 좋아하는 시간대는? 그때 주로 뭐해?
  [
    '밤 11시, 조용히 혼자 생각 정리',
    '오전 7시, 상쾌하게 하루 시작',
    '저녁 6시 퇴근 후, 맥주 한 캔',
    '점심시간, 좋아하는 곳에서 밥 먹기',
    '새벽 1시, 유튜브 보다가 잠들기',
  ],
  // Q9: 내가 절대 양보 못하는 것은?
  [
    '잠자는 시간',
    '주말 나만의 시간',
    '좋아하는 음식 앞에서의 자리',
    '내 신념과 가치관',
    '운동 루틴',
  ],
  // Q10: 나를 한 단어로 표현한다면?
  [
    '따뜻함',
    '즉흥',
    '성실',
    '유쾌',
    '진심',
  ],
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

function buildIntroAnswers(index: number): string[] {
  // 각 질문마다 index 기반으로 답변 선택 (일관성 + 약간의 변형)
  return INTRO_ANSWERS_POOL.map((pool) => pool[index % pool.length]);
}

const FEMALE_AVATARS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];
const MALE_AVATARS   = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];

function profileImageUrl(gender: string): string {
  const pool = gender === 'FEMALE' ? FEMALE_AVATARS : MALE_AVATARS;
  return `/assets/avatar/${pool[Math.floor(Math.random() * pool.length)]}.svg`;
}

function buildIntroduction(userData: { name: string; nickname: string; age: number; gender: string }): string {
  const greetings = [
    `안녕하세요! ${userData.nickname}이에요. 같이 좋은 시간 만들어가요 😊`,
    `반갑습니다~ ${userData.age}살 ${userData.name}이에요. 잘 부탁드려요!`,
    `처음 뵙겠습니다, ${userData.nickname}이라고 해요. 일상을 나눠봐요 🌿`,
    `안녕하세요~ 소소하지만 확실한 행복을 좋아하는 ${userData.nickname}이에요.`,
    `잘 부탁드립니다! 진심으로 대화하는 걸 좋아하는 ${userData.name}이에요 ✨`,
  ];
  return pickRandom(greetings);
}

@Injectable()
export class SeedDummyDataUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly systemStateService: SystemStateService,
  ) {}

  async execute(): Promise<AdminSeedDummyResultDto> {
    const year = await this.systemStateService.getCurrentYear();
    const month = await this.systemStateService.getCurrentMonth();
    const week = await this.systemStateService.getCurrentWeek();

    const startDate = WeekCalculator.getWeekStartDate(year, month, week);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const userRole = await this.prisma.role.findFirst({ where: { code: 'USER' } });
    if (!userRole) throw new Error('USER role not found');

    // ── 1:1 퀴즈셋 확보 ──
    let oneToOneSet: QuizSetWithQuizzes = (await this.prisma.quizSet.findFirst({
      where: { year, month, week, matchingType: MatchingType.ONE_TO_ONE, isActive: true },
      include: { quizzes: { include: { choices: true } } },
    })) as QuizSetWithQuizzes | null ?? await this.createQuizSet(year, month, week, startDate, endDate, MatchingType.ONE_TO_ONE, '연애', this.oneToOneQuizData());

    // ── GROUP 퀴즈셋 확보 ──
    const usedCats = (await this.prisma.quizSet.findMany({ where: { year, month, week }, select: { category: true } })).map((q) => q.category);
    const groupCategory = ['동물', '음식', '취미', '여행'].find((c) => !usedCats.includes(c)) ?? '문화';
    let groupSet: QuizSetWithQuizzes = (await this.prisma.quizSet.findFirst({
      where: { year, month, week, matchingType: MatchingType.GROUP, isActive: true },
      include: { quizzes: { include: { choices: true } } },
    })) as QuizSetWithQuizzes | null ?? await this.createQuizSet(year, month, week, startDate, endDate, MatchingType.GROUP, groupCategory, this.groupQuizData());

    // ── 1:1 유저 15명 생성 ──
    const oneToOneIds: string[] = [];
    for (let i = 0; i < ONE_TO_ONE_USERS.length; i++) {
      const u = ONE_TO_ONE_USERS[i];
      const user = await this.upsertUser(u, userRole.id, i);
      await this.completeQuiz(user.id, oneToOneSet, year, month, week);
      oneToOneIds.push(user.id);
    }

    // ── 1:1 매칭 요청 생성 (남→여 7쌍: 3 ACCEPTED, 2 PENDING, 2 REJECTED) ──
    const maleIds = oneToOneIds.slice(0, 8);
    const femaleIds = oneToOneIds.slice(8, 15);
    const matchPlan: { mIdx: number; fIdx: number; status: 'ACCEPTED' | 'PENDING' | 'REJECTED' }[] = [
      { mIdx: 0, fIdx: 0, status: 'ACCEPTED' },
      { mIdx: 1, fIdx: 1, status: 'ACCEPTED' },
      { mIdx: 2, fIdx: 2, status: 'ACCEPTED' },
      { mIdx: 3, fIdx: 3, status: 'PENDING' },
      { mIdx: 4, fIdx: 4, status: 'PENDING' },
      { mIdx: 5, fIdx: 5, status: 'REJECTED' },
      { mIdx: 6, fIdx: 6, status: 'REJECTED' },
    ];

    let createdMatchRequests = 0;
    let createdChatRooms = 0;
    for (const plan of matchPlan) {
      const result = await this.upsertMatchRequest(
        oneToOneSet.id, maleIds[plan.mIdx], femaleIds[plan.fIdx], plan.status,
      );
      if (result.created) createdMatchRequests++;
      if (result.chatRoom) createdChatRooms++;
    }

    // ── GROUP 유저 15명 생성 ──
    const groupIds: string[] = [];
    for (let i = 0; i < GROUP_USERS.length; i++) {
      const u = GROUP_USERS[i];
      const user = await this.upsertUser(u, userRole.id, i + 15);
      await this.completeQuiz(user.id, groupSet, year, month, week);
      groupIds.push(user.id);
    }

    // ── 그룹 채팅방 생성 & 참여 ──
    let groupRoom = await this.prisma.chatRoom.findUnique({ where: { quizSetId: groupSet.id } });
    if (!groupRoom) {
      groupRoom = await this.prisma.chatRoom.create({ data: { quizSetId: groupSet.id } });
      createdChatRooms++;
    }
    for (const userId of groupIds) {
      const exists = await this.prisma.chatParticipant.findUnique({ where: { roomId_userId: { roomId: groupRoom.id, userId } } });
      if (!exists) {
        await this.prisma.chatParticipant.create({ data: { roomId: groupRoom.id, userId } });
      }
    }

    return {
      createdUsers: ONE_TO_ONE_USERS.length + GROUP_USERS.length,
      oneToOneUsers: ONE_TO_ONE_USERS.length,
      groupUsers: GROUP_USERS.length,
      matchRequests: createdMatchRequests,
      chatRooms: createdChatRooms,
    };
  }

  // ─────────────────────────────────────────────
  // 내부 헬퍼
  // ─────────────────────────────────────────────

  private async upsertUser(
    u: { name: string; nickname: string; gender: string; age: number; phone: string },
    roleId: number,
    idx: number,
  ) {
    let user = await this.prisma.user.findUnique({ where: { phoneNumber: u.phone } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: u.name,
          nickname: u.nickname,
          phoneNumber: u.phone,
          gender: u.gender,
          age: u.age,
          roleId,
          email: `dummy_${u.phone}@ditto.dev`,
          socialAccounts: {
            create: { provider: 'test', providerUserId: `dummy_${u.phone}` },
          },
          profile: {
            create: {
              introduction: buildIntroduction(u),
              profileImageUrl: profileImageUrl(u.gender),
              location: pickRandom(LOCATIONS),
              occupation: pickRandom(OCCUPATIONS),
              interests: pickRandomN(INTEREST_POOL, Math.floor(Math.random() * 3) + 2),
              preferredMinAge: 22,
              preferredMaxAge: 36,
            },
          },
        },
      });

      // 소개 노트 (10개 답변)
      await this.prisma.userIntroNote.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, answers: buildIntroAnswers(idx) },
      });
    } else {
      // 기존 유저: 프로필/소개 노트 업데이트
      await this.prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {
          introduction: buildIntroduction(u),
          profileImageUrl: profileImageUrl(u.gender),
        },
        create: {
          userId: user.id,
          introduction: buildIntroduction(u),
          profileImageUrl: profileImageUrl(u.gender),
          location: pickRandom(LOCATIONS),
          occupation: pickRandom(OCCUPATIONS),
          interests: pickRandomN(INTEREST_POOL, 3),
          preferredMinAge: 22,
          preferredMaxAge: 36,
        },
      });
      await this.prisma.userIntroNote.upsert({
        where: { userId: user.id },
        update: { answers: buildIntroAnswers(idx) },
        create: { userId: user.id, answers: buildIntroAnswers(idx) },
      });
    }

    return user;
  }

  private async completeQuiz(
    userId: string,
    quizSet: QuizSetWithQuizzes,
    year: number,
    month: number,
    week: number,
  ) {
    const existing = await this.prisma.userQuizProgress.findUnique({
      where: { userId_year_month_week: { userId, year, month, week } },
    });
    if (existing?.status === 'COMPLETED') return;

    for (const quiz of quizSet.quizzes) {
      const hasAnswer = await this.prisma.quizAnswer.findFirst({ where: { userId, quizId: quiz.id } });
      if (!hasAnswer) {
        const choice = quiz.choices[Math.floor(Math.random() * quiz.choices.length)];
        await this.prisma.quizAnswer.create({ data: { userId, quizId: quiz.id, choiceId: choice.id } });
      }
    }

    await this.prisma.userQuizProgress.upsert({
      where: { userId_year_month_week: { userId, year, month, week } },
      update: { status: 'COMPLETED', completedAt: new Date(), quizSetId: quizSet.id },
      create: { userId, year, month, week, quizSetId: quizSet.id, status: 'COMPLETED', completedAt: new Date() },
    });
  }

  private async upsertMatchRequest(
    quizSetId: string,
    fromUserId: string,
    toUserId: string,
    status: 'ACCEPTED' | 'PENDING' | 'REJECTED',
  ): Promise<{ created: boolean; chatRoom: boolean }> {
    const existing = await this.prisma.matchRequest.findUnique({
      where: { quizSetId_fromUserId_toUserId: { quizSetId, fromUserId, toUserId } },
    });
    if (existing) return { created: false, chatRoom: false };

    const fromAnswers = await this.prisma.quizAnswer.findMany({ where: { userId: fromUserId, quiz: { quizSetId } } });
    const toAnswers = await this.prisma.quizAnswer.findMany({ where: { userId: toUserId, quiz: { quizSetId } } });
    const toMap = new Map(toAnswers.map((a) => [a.quizId, a.choiceId]));
    const matched = fromAnswers.filter((a) => toMap.get(a.quizId) === a.choiceId).length;
    const score = fromAnswers.length > 0 ? Math.round((matched / fromAnswers.length) * 100) : 0;

    const mr = await this.prisma.matchRequest.create({
      data: {
        quizSetId,
        fromUserId,
        toUserId,
        status,
        score,
        scoreBreakdown: { quizMatchRate: score, matchedQuestions: matched, totalQuestions: fromAnswers.length, reasons: [] },
        algorithmVersion: 'v1',
        respondedAt: status !== 'PENDING' ? new Date() : null,
      },
    });

    let chatRoom = false;
    if (status === 'ACCEPTED') {
      await this.prisma.chatRoom.create({
        data: {
          matchRequestId: mr.id,
          participants: { create: [{ userId: fromUserId }, { userId: toUserId }] },
        },
      });
      chatRoom = true;
    }

    return { created: true, chatRoom };
  }

  private async createQuizSet(
    year: number, month: number, week: number,
    startDate: Date, endDate: Date,
    matchingType: MatchingType, category: string,
    quizData: { question: string; choices: [string, string] }[],
  ) {
    return this.prisma.quizSet.create({
      data: {
        id: crypto.randomUUID(),
        year, month, week, category,
        title: `${year}년 ${month}월 ${week}주차 ${category} 퀴즈`,
        description: `${category}에 관한 밸런스 게임 퀴즈입니다.`,
        startDate, endDate,
        isActive: true,
        matchingType,
        quizzes: {
          create: quizData.map((q, i) => ({
            id: crypto.randomUUID(),
            question: q.question,
            order: i + 1,
            choices: {
              create: [
                { id: crypto.randomUUID(), text: q.choices[0], order: 1 },
                { id: crypto.randomUUID(), text: q.choices[1], order: 2 },
              ],
            },
          })),
        },
      },
      include: { quizzes: { include: { choices: true } } },
    });
  }

  private oneToOneQuizData() {
    return [
      { question: '이상형의 첫인상은?',             choices: ['외모가 먼저 눈에 띄는 사람', '분위기로 끌리는 사람'] },
      { question: '연인과 주말 보내기',              choices: ['집에서 같이 넷플릭스', '밖에서 데이트'] },
      { question: '사랑 표현 방식',                 choices: ['말로 자주 표현', '행동으로 보여줌'] },
      { question: '연락 스타일',                    choices: ['자주 연락하는 게 좋아', '각자 생활 중 연락'] },
      { question: '싸웠을 때',                     choices: ['바로 풀고 싶어', '좀 식히고 나서'] },
      { question: '이상적인 첫 데이트',              choices: ['조용한 카페에서 대화', '같이 활동하면서'] },
      { question: '연인에게 기대하는 것',             choices: ['정서적 지지와 공감', '함께하는 즐거운 활동'] },
      { question: '기념일 챙기기',                  choices: ['꼭 특별하게 챙긴다', '평소처럼 보내도 OK'] },
      { question: '관계 초반 속도',                 choices: ['천천히 알아가기', '빠르게 가까워지기'] },
      { question: '중요한 결정을 할 때',             choices: ['혼자 결정 후 공유', '같이 의논하고 결정'] },
      { question: '연인의 친구들과',                choices: ['자주 어울리고 싶어', '각자 친구 관계 유지'] },
      { question: '미래 계획 이야기',               choices: ['일찍부터 함께 계획', '자연스럽게 흘러가도록'] },
    ] as { question: string; choices: [string, string] }[];
  }

  private groupQuizData() {
    return [
      { question: '여행 스타일은?',                 choices: ['꼼꼼한 일정 계획파', '즉흥적으로 떠나는 파'] },
      { question: '취미 생활은?',                   choices: ['혼자 즐기는 취미', '같이 즐기는 취미'] },
      { question: '음식 탐방',                      choices: ['유명한 맛집 찾아가기', '우연히 발견한 숨은 맛집'] },
      { question: '주말 에너지 충전',               choices: ['집에서 푹 쉬기', '밖에서 활동하기'] },
      { question: '모임 스타일',                    choices: ['소수 친한 친구 모임', '다양한 사람들 큰 모임'] },
      { question: '새로운 경험',                    choices: ['검증된 것을 다시', '새로운 것 도전'] },
      { question: '영화 보기',                      choices: ['영화관에서 꼭 봐야지', '집에서 편하게'] },
      { question: '산 vs 바다',                     choices: ['산 하이킹이 좋아', '바다 여행이 최고'] },
      { question: '카페 vs 공원',                   choices: ['카페에서 수다 삼매경', '공원에서 산책하며'] },
      { question: '음악 취향',                      choices: ['K-POP & 팝송', '인디 & 밴드 음악'] },
      { question: '콘서트 vs 페스티벌',              choices: ['좋아하는 가수 콘서트', '다양한 음악 페스티벌'] },
      { question: 'SNS 스타일',                     choices: ['자주 올리고 공유', '보는 걸 더 좋아함'] },
    ] as { question: string; choices: [string, string] }[];
  }
}
