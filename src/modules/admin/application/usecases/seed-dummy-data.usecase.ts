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
// 더미 유저 데이터 (1:1: 25남 25녀, GROUP: 25남 25녀)
// ─────────────────────────────────────────────
const ONE_TO_ONE_USERS = [
  // 남성 25명 (20~35세)
  { name: '김민준', nickname: '민준이형', gender: 'MALE', age: 22, phone: '01033330001' },
  { name: '이도현', nickname: '도현킹',   gender: 'MALE', age: 27, phone: '01033330002' },
  { name: '박준서', nickname: '준서베',   gender: 'MALE', age: 25, phone: '01033330003' },
  { name: '최지훈', nickname: '지훈맨',   gender: 'MALE', age: 30, phone: '01033330004' },
  { name: '정우진', nickname: '우진이',   gender: 'MALE', age: 28, phone: '01033330005' },
  { name: '강현우', nickname: '현우베',   gender: 'MALE', age: 31, phone: '01033330006' },
  { name: '조성민', nickname: '성민킹',   gender: 'MALE', age: 26, phone: '01033330007' },
  { name: '윤태양', nickname: '태양맨',   gender: 'MALE', age: 29, phone: '01033330008' },
  { name: '한승원', nickname: '승원이',   gender: 'MALE', age: 23, phone: '01033330009' },
  { name: '오재원', nickname: '재원킹',   gender: 'MALE', age: 24, phone: '01033330010' },
  { name: '배민혁', nickname: '민혁이',   gender: 'MALE', age: 33, phone: '01033330011' },
  { name: '신준호', nickname: '준호베',   gender: 'MALE', age: 21, phone: '01033330012' },
  { name: '류성준', nickname: '성준이',   gender: 'MALE', age: 26, phone: '01033330013' },
  { name: '문도윤', nickname: '도윤킹',   gender: 'MALE', age: 32, phone: '01033330014' },
  { name: '전세훈', nickname: '세훈베',   gender: 'MALE', age: 28, phone: '01033330015' },
  { name: '고승우', nickname: '승우맨',   gender: 'MALE', age: 27, phone: '01033330016' },
  { name: '임재원', nickname: '재원이',   gender: 'MALE', age: 22, phone: '01033330017' },
  { name: '서지훈', nickname: '지훈킹',   gender: 'MALE', age: 30, phone: '01033330018' },
  { name: '권도윤', nickname: '도윤이',   gender: 'MALE', age: 24, phone: '01033330019' },
  { name: '황민석', nickname: '민석이',   gender: 'MALE', age: 29, phone: '01033330020' },
  { name: '남주혁', nickname: '주혁이',   gender: 'MALE', age: 25, phone: '01033330021' },
  { name: '안재현', nickname: '재현킹',   gender: 'MALE', age: 34, phone: '01033330022' },
  { name: '송민규', nickname: '민규베',   gender: 'MALE', age: 23, phone: '01033330023' },
  { name: '차은성', nickname: '은성이',   gender: 'MALE', age: 27, phone: '01033330024' },
  { name: '변우진', nickname: '우진베',   gender: 'MALE', age: 25, phone: '01033330025' },
  // 여성 25명 (20~35세)
  { name: '이서연', nickname: '서연쓰',   gender: 'FEMALE', age: 24, phone: '01033330026' },
  { name: '김지아', nickname: '지아야',   gender: 'FEMALE', age: 26, phone: '01033330027' },
  { name: '박소율', nickname: '소율이',   gender: 'FEMALE', age: 25, phone: '01033330028' },
  { name: '최유나', nickname: '유나야',   gender: 'FEMALE', age: 29, phone: '01033330029' },
  { name: '정하은', nickname: '하은쓰',   gender: 'FEMALE', age: 28, phone: '01033330030' },
  { name: '강나린', nickname: '나린이',   gender: 'FEMALE', age: 23, phone: '01033330031' },
  { name: '조채원', nickname: '채원다',   gender: 'FEMALE', age: 27, phone: '01033330032' },
  { name: '한예슬', nickname: '예슬쓰',   gender: 'FEMALE', age: 22, phone: '01033330033' },
  { name: '오지현', nickname: '지현이야', gender: 'FEMALE', age: 26, phone: '01033330034' },
  { name: '배수지', nickname: '수지야',   gender: 'FEMALE', age: 31, phone: '01033330035' },
  { name: '신미래', nickname: '미래야',   gender: 'FEMALE', age: 25, phone: '01033330036' },
  { name: '류아린', nickname: '아린쓰',   gender: 'FEMALE', age: 21, phone: '01033330037' },
  { name: '문하늘', nickname: '하늘이',   gender: 'FEMALE', age: 28, phone: '01033330038' },
  { name: '전지은', nickname: '지은쓰',   gender: 'FEMALE', age: 24, phone: '01033330039' },
  { name: '임수아', nickname: '수아야',   gender: 'FEMALE', age: 22, phone: '01033330040' },
  { name: '서지원', nickname: '지원이',   gender: 'FEMALE', age: 27, phone: '01033330041' },
  { name: '권나연', nickname: '나연쓰',   gender: 'FEMALE', age: 25, phone: '01033330042' },
  { name: '황수빈', nickname: '수빈이',   gender: 'FEMALE', age: 23, phone: '01033330043' },
  { name: '남지현', nickname: '지현쓰',   gender: 'FEMALE', age: 29, phone: '01033330044' },
  { name: '안소희', nickname: '소희야',   gender: 'FEMALE', age: 26, phone: '01033330045' },
  { name: '송지효', nickname: '지효쓰',   gender: 'FEMALE', age: 30, phone: '01033330046' },
  { name: '홍은지', nickname: '은지야',   gender: 'FEMALE', age: 24, phone: '01033330047' },
  { name: '문채원', nickname: '채원쓰',   gender: 'FEMALE', age: 28, phone: '01033330048' },
  { name: '공효진', nickname: '효진이',   gender: 'FEMALE', age: 33, phone: '01033330049' },
  { name: '장나라', nickname: '나라야',   gender: 'FEMALE', age: 22, phone: '01033330050' },
];

const GROUP_USERS = [
  // 남성 25명 (20~35세)
  { name: '한동훈', nickname: '동훈맨',   gender: 'MALE', age: 25, phone: '01044440001' },
  { name: '오준혁', nickname: '준혁킹',   gender: 'MALE', age: 26, phone: '01044440002' },
  { name: '배태민', nickname: '태민베',   gender: 'MALE', age: 30, phone: '01044440003' },
  { name: '신민재', nickname: '민재오빠', gender: 'MALE', age: 28, phone: '01044440004' },
  { name: '류성재', nickname: '성재이',   gender: 'MALE', age: 25, phone: '01044440005' },
  { name: '문도현', nickname: '도현이',   gender: 'MALE', age: 32, phone: '01044440006' },
  { name: '전재훈', nickname: '재훈베',   gender: 'MALE', age: 27, phone: '01044440007' },
  { name: '고승현', nickname: '승현맨',   gender: 'MALE', age: 24, phone: '01044440008' },
  { name: '임민호', nickname: '민호이',   gender: 'MALE', age: 29, phone: '01044440009' },
  { name: '서준혁', nickname: '준혁이',   gender: 'MALE', age: 22, phone: '01044440010' },
  { name: '권재원', nickname: '재원킹',   gender: 'MALE', age: 26, phone: '01044440011' },
  { name: '황태양', nickname: '태양킹',   gender: 'MALE', age: 31, phone: '01044440012' },
  { name: '남성민', nickname: '성민이',   gender: 'MALE', age: 24, phone: '01044440013' },
  { name: '안현우', nickname: '현우맨',   gender: 'MALE', age: 28, phone: '01044440014' },
  { name: '송재현', nickname: '재현이',   gender: 'MALE', age: 25, phone: '01044440015' },
  { name: '차민석', nickname: '민석베',   gender: 'MALE', age: 23, phone: '01044440016' },
  { name: '변준서', nickname: '준서맨',   gender: 'MALE', age: 29, phone: '01044440017' },
  { name: '장도윤', nickname: '도윤베',   gender: 'MALE', age: 27, phone: '01044440018' },
  { name: '윤민재', nickname: '민재킹',   gender: 'MALE', age: 33, phone: '01044440019' },
  { name: '조현준', nickname: '현준이',   gender: 'MALE', age: 25, phone: '01044440020' },
  { name: '강지훈', nickname: '지훈이',   gender: 'MALE', age: 21, phone: '01044440021' },
  { name: '이승우', nickname: '승우킹',   gender: 'MALE', age: 30, phone: '01044440022' },
  { name: '박태민', nickname: '태민이',   gender: 'MALE', age: 26, phone: '01044440023' },
  { name: '최재원', nickname: '재원맨',   gender: 'MALE', age: 28, phone: '01044440024' },
  { name: '정민준', nickname: '민준킹',   gender: 'MALE', age: 24, phone: '01044440025' },
  // 여성 25명 (20~35세)
  { name: '하지원', nickname: '지원야',   gender: 'FEMALE', age: 25, phone: '01044440026' },
  { name: '유인나', nickname: '인나쓰',   gender: 'FEMALE', age: 28, phone: '01044440027' },
  { name: '손예진', nickname: '예진이',   gender: 'FEMALE', age: 29, phone: '01044440028' },
  { name: '전혜빈', nickname: '혜빈쓰',   gender: 'FEMALE', age: 24, phone: '01044440029' },
  { name: '김보라', nickname: '보라야',   gender: 'FEMALE', age: 27, phone: '01044440030' },
  { name: '이선빈', nickname: '선빈쓰',   gender: 'FEMALE', age: 23, phone: '01044440031' },
  { name: '박규리', nickname: '규리야',   gender: 'FEMALE', age: 30, phone: '01044440032' },
  { name: '최수영', nickname: '수영쓰',   gender: 'FEMALE', age: 26, phone: '01044440033' },
  { name: '정소민', nickname: '소민이',   gender: 'FEMALE', age: 22, phone: '01044440034' },
  { name: '강한나', nickname: '한나야',   gender: 'FEMALE', age: 28, phone: '01044440035' },
  { name: '조이현', nickname: '이현쓰',   gender: 'FEMALE', age: 25, phone: '01044440036' },
  { name: '윤아현', nickname: '아현야',   gender: 'FEMALE', age: 31, phone: '01044440037' },
  { name: '한소희', nickname: '소희쓰',   gender: 'FEMALE', age: 23, phone: '01044440038' },
  { name: '임지연', nickname: '지연이',   gender: 'FEMALE', age: 27, phone: '01044440039' },
  { name: '서은수', nickname: '은수야',   gender: 'FEMALE', age: 25, phone: '01044440040' },
  { name: '권은빈', nickname: '은빈쓰',   gender: 'FEMALE', age: 29, phone: '01044440041' },
  { name: '황정음', nickname: '정음이',   gender: 'FEMALE', age: 22, phone: '01044440042' },
  { name: '남예원', nickname: '예원이',   gender: 'FEMALE', age: 26, phone: '01044440043' },
  { name: '안은진', nickname: '은진쓰',   gender: 'FEMALE', age: 24, phone: '01044440044' },
  { name: '송하윤', nickname: '하윤이',   gender: 'FEMALE', age: 28, phone: '01044440045' },
  { name: '차지연', nickname: '지연쓰',   gender: 'FEMALE', age: 30, phone: '01044440046' },
  { name: '변세희', nickname: '세희야',   gender: 'FEMALE', age: 25, phone: '01044440047' },
  { name: '장수빈', nickname: '수빈야',   gender: 'FEMALE', age: 23, phone: '01044440048' },
  { name: '류소연', nickname: '소연이',   gender: 'FEMALE', age: 27, phone: '01044440049' },
  { name: '문지원', nickname: '지원쓰',   gender: 'FEMALE', age: 22, phone: '01044440050' },
];

const LOCATIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '수원', '성남'];
const OCCUPATIONS = ['개발자', '디자이너', '마케터', '의사', '교사', '회계사', '금융', '학생', '프리랜서', '영업', '간호사', '공무원', '연구원', '작가'];
const INTEREST_POOL = ['workout', 'movie-drama', 'performance', 'photography', 'reading', 'music', 'cooking', 'travel', 'gaming', 'finance', 'self-improvement', 'pets'];

// 10개 소개 노트 질문에 대한 답변 풀 (각 10개)
const INTRO_ANSWERS_POOL: string[][] = [
  // Q1: 여행갈 때 꼭 챙겨야 하는 3가지는?
  [
    '선글라스, 카메라, 여행 책자',
    '이어폰, 보조배터리, 스낵',
    '편한 신발, 카메라, 일기장',
    '여권, 충전기, 상비약',
    '스니커즈, 선크림, 이어폰',
    '카메라, 텀블러, 간식',
    '책, 노트북, 이어폰',
    '운동화, 보조배터리, 선글라스',
    '충전기, 세면도구, 편한 옷',
    '지갑, 이어폰, 물티슈',
  ],
  // Q2: 주말 아침 10시, 나는 주로 뭐하고 있을까?
  [
    '카페에서 커피 한 잔 하며 책 읽기',
    '늦잠 자다가 이제 막 일어남',
    '조깅하고 돌아와서 샤워 중',
    '유튜브 보면서 브런치 먹기',
    '친구한테 주말 약속 잡는 카톡 보내기',
    '헬스장 가는 준비 중',
    '집에서 음악 들으며 청소 중',
    '넷플릭스 보다가 잠든 자세로 눈 뜸',
    '근처 시장이나 마트 장보러 나가는 중',
    '브런치 카페 예약 잡는 중',
  ],
  // Q3: 친구들이 나한테 제일 많이 하는 말은?
  [
    '너 왜 이렇게 웃겨ㅋㅋ',
    '진짜 한결같다',
    '너 없으면 심심해',
    '의외로 섬세하다',
    '어떻게 저런 생각을 하지',
    '너랑 있으면 시간 가는 줄 모름',
    '표정이 너무 솔직해',
    '나중에 꼭 성공할 것 같아',
    '진심으로 대해줘서 고마워',
    '말투는 무뚝뚝한데 마음은 따뜻해',
  ],
  // Q4: 스트레스 받을 때 나만의 해소법은?
  [
    '드라이브 하면서 음악 크게 틀기',
    '맛있는 거 먹으러 가기',
    '집에서 영화 정주행',
    '헬스장 가서 운동하기',
    '혼자 카페 가서 멍 때리기',
    '친한 친구한테 전화해서 수다 떨기',
    '유튜브나 게임으로 머리 비우기',
    '자전거 타며 바람 맞기',
    '좋아하는 음악 플레이리스트 켜고 산책',
    '모르는 동네 혼자 걸어다니기',
  ],
  // Q5: 최근 1년 내 가장 잘한 선택은?
  [
    '직장 바꾼 것',
    '헬스 등록한 것',
    '여행 즉흥으로 떠난 것',
    '새 취미 시작한 것',
    '오래된 친구한테 먼저 연락한 것',
    '자취 시작한 것',
    '운전면허 딴 것',
    '책 읽는 습관 들인 것',
    '유해한 관계 정리한 것',
    '좋아하는 일을 부업으로 시작한 것',
  ],
  // Q6: 나를 가장 행복하게 만드는 순간은?
  [
    '사랑하는 사람들과 맛있는 걸 먹을 때',
    '계획했던 일이 딱 맞아떨어질 때',
    '오랜 친구를 오랜만에 만날 때',
    '혼자 좋아하는 공간에 있을 때',
    '음악이 지금 내 감정에 딱 맞을 때',
    '오랜만에 빈 하루를 갖게 됐을 때',
    '노력한 게 결과로 보일 때',
    '낯선 곳에서 예상 못한 경험을 할 때',
    '좋아하는 음식을 먹을 때',
    '아무 계획 없이 늘어지게 쉴 때',
  ],
  // Q7: 요즘 내가 가장 많이 쓰는 앱 3개는?
  [
    '카카오톡, 유튜브, 인스타그램',
    '스포티파이, 네이버지도, 카카오톡',
    '틱톡, 당근마켓, 카카오톡',
    '유튜브, 카카오톡, 네이버',
    '인스타그램, 카카오톡, 쿠팡',
    '카카오톡, 넷플릭스, 배달의민족',
    '유튜브, 인스타그램, 카카오뱅크',
    '카카오톡, 카카오맵, 쿠팡이츠',
    '트위터, 유튜브, 카카오톡',
    '카카오톡, 라인, 멜론',
  ],
  // Q8: 하루 중 가장 좋아하는 시간대는? 그때 주로 뭐해?
  [
    '밤 11시, 조용히 혼자 생각 정리',
    '오전 7시, 상쾌하게 하루 시작',
    '저녁 6시 퇴근 후, 맥주 한 캔',
    '점심시간, 좋아하는 곳에서 밥 먹기',
    '새벽 1시, 유튜브 보다가 잠들기',
    '오후 3시, 카페에서 커피 한 잔',
    '밤 10시, 좋아하는 드라마 보기',
    '오전 9시, 커피 마시며 하루 계획 세우기',
    '자기 전 30분, 책 읽기',
    '저녁 8시, 운동하고 샤워 후 치킨',
  ],
  // Q9: 내가 절�� 양보 못하는 것은?
  [
    '잠자는 시간',
    '주말 나만의 시간',
    '좋아하는 음식 앞에서의 자리',
    '내 신념과 가치관',
    '운동 루틴',
    '혼자만의 공간',
    '약속 시간 지키기',
    '음악 취향',
    '고수 없는 음식',
    '취침 전 스마트폰 금지 시간',
  ],
  // Q10: 나를 한 단어로 표현한다면?
  [
    '따뜻함',
    '즉흥',
    '성실',
    '유쾌',
    '진심',
    '호기심',
    '묵묵함',
    '열정',
    '여유',
    '솔직함',
  ],
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

function buildIntroAnswers(index: number): string[] {
  return INTRO_ANSWERS_POOL.map((pool) => pool[index % pool.length]);
}

const FEMALE_AVATARS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];
const MALE_AVATARS   = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];

function profileImageUrl(gender: string): string {
  const pool = gender === 'FEMALE' ? FEMALE_AVATARS : MALE_AVATARS;
  return `/assets/avatar/${pool[Math.floor(Math.random() * pool.length)]}.png`;
}

function buildIntroduction(userData: { name: string; nickname: string; age: number; gender: string }): string {
  const greetings = [
    `안녕하세요! ${userData.nickname}이에요. 같이 좋은 시간 만들어가요 😊`,
    `반갑습니다~ ${userData.age}살 ${userData.name}이에요. 잘 부탁드려요!`,
    `처음 뵙겠습니다, ${userData.nickname}이라고 해요. 일상을 나눠봐요 🌿`,
    `안녕하세요~ 소소하지만 확실한 행복을 좋아하는 ${userData.nickname}이에요.`,
    `잘 부탁드립니다! 진심으로 대화하는 걸 좋아하는 ${userData.name}이에요 ✨`,
    `${userData.nickname}입니다. 좋은 인연 만들고 싶어요!`,
    `안녕하세요, ${userData.age}살 ${userData.name}이에요. 잘 부탁드려요 :)`,
  ];
  return pickRandom(greetings);
}

/**
 * 나이 기반 선호 나이 범위 계산
 * 실제 앱과 동일하게 나이대(bracket)로 처리: age ± 10살, 최소 20세
 */
function preferredAgeRange(age: number): { preferredMinAge: number; preferredMaxAge: number } {
  return {
    preferredMinAge: Math.max(20, age - 10),
    preferredMaxAge: age + 10,
  };
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

    // ── 1:1 유저 50명 생성 ──
    const oneToOneIds: string[] = [];
    for (let i = 0; i < ONE_TO_ONE_USERS.length; i++) {
      const u = ONE_TO_ONE_USERS[i];
      const user = await this.upsertUser(u, userRole.id, i);
      await this.completeQuiz(user.id, oneToOneSet, year, month, week);
      oneToOneIds.push(user.id);
    }

    // ── 1:1 매칭 요청 생성 (남→여 15쌍: 5 ACCEPTED, 5 PENDING, 5 REJECTED) ──
    const maleIds = oneToOneIds.slice(0, 25);
    const femaleIds = oneToOneIds.slice(25, 50);
    const matchPlan: { mIdx: number; fIdx: number; status: 'ACCEPTED' | 'PENDING' | 'REJECTED' }[] = [
      { mIdx: 0,  fIdx: 0,  status: 'ACCEPTED' },
      { mIdx: 1,  fIdx: 1,  status: 'ACCEPTED' },
      { mIdx: 2,  fIdx: 2,  status: 'ACCEPTED' },
      { mIdx: 3,  fIdx: 3,  status: 'ACCEPTED' },
      { mIdx: 4,  fIdx: 4,  status: 'ACCEPTED' },
      { mIdx: 5,  fIdx: 5,  status: 'PENDING' },
      { mIdx: 6,  fIdx: 6,  status: 'PENDING' },
      { mIdx: 7,  fIdx: 7,  status: 'PENDING' },
      { mIdx: 8,  fIdx: 8,  status: 'PENDING' },
      { mIdx: 9,  fIdx: 9,  status: 'PENDING' },
      { mIdx: 10, fIdx: 10, status: 'REJECTED' },
      { mIdx: 11, fIdx: 11, status: 'REJECTED' },
      { mIdx: 12, fIdx: 12, status: 'REJECTED' },
      { mIdx: 13, fIdx: 13, status: 'REJECTED' },
      { mIdx: 14, fIdx: 14, status: 'REJECTED' },
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

    // ── GROUP 유저 50명 생성 ──
    const groupIds: string[] = [];
    for (let i = 0; i < GROUP_USERS.length; i++) {
      const u = GROUP_USERS[i];
      const user = await this.upsertUser(u, userRole.id, i + 50);
      await this.completeQuiz(user.id, groupSet, year, month, week);
      groupIds.push(user.id);
    }

    // ── 그룹 채팅방 생성만 (참여자 추가 안 함 — 어드민이 직접 컨트롤) ──
    const existingGroupRoom = await this.prisma.chatRoom.findUnique({ where: { quizSetId: groupSet.id } });
    if (!existingGroupRoom) {
      await this.prisma.chatRoom.create({ data: { quizSetId: groupSet.id } });
      createdChatRooms++;
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
              ...preferredAgeRange(u.age),
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
          ...preferredAgeRange(u.age),
        },
        create: {
          userId: user.id,
          introduction: buildIntroduction(u),
          profileImageUrl: profileImageUrl(u.gender),
          location: pickRandom(LOCATIONS),
          occupation: pickRandom(OCCUPATIONS),
          interests: pickRandomN(INTEREST_POOL, 3),
          ...preferredAgeRange(u.age),
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
      { question: '싸웠을 때',                      choices: ['바로 풀고 싶어', '좀 식히고 나서'] },
      { question: '이상적인 첫 데이트',              choices: ['조용한 카페에서 대화', '같이 활동하면서'] },
      { question: '연인에게 기대하는 것',             choices: ['정서적 지지와 공감', '함께하는 즐거운 활동'] },
      { question: '기념일 챙기기',                   choices: ['꼭 특별하게 챙긴다', '평소처럼 보내도 OK'] },
      { question: '관계 초반 속도',                  choices: ['천천히 알아가기', '빠르게 가까워지기'] },
      { question: '중요한 결정을 할 때',              choices: ['혼자 결정 후 공유', '같이 의논하고 결정'] },
      { question: '연인의 친구들과',                 choices: ['자주 어울리고 싶어', '각자 친구 관계 유지'] },
      { question: '미래 계획 이야기',                choices: ['일찍부터 함께 계획', '자연스럽게 흘러가도록'] },
    ] as { question: string; choices: [string, string] }[];
  }

  private groupQuizData() {
    return [
      { question: '여행 스타일은?',                  choices: ['꼼꼼한 일정 계획파', '즉흥적으로 떠나는 파'] },
      { question: '취미 생활은?',                    choices: ['혼자 즐기는 취미', '같이 즐기는 취미'] },
      { question: '음식 탐방',                       choices: ['유명한 맛집 찾아가기', '우연히 발견한 숨은 맛집'] },
      { question: '주말 에너지 충전',                choices: ['집에서 푹 쉬기', '밖에서 활동하기'] },
      { question: '모임 스타일',                     choices: ['소수 친한 친구 모임', '다양한 사람들 큰 모임'] },
      { question: '새로운 경험',                     choices: ['검증된 것을 다시', '새로운 것 도전'] },
      { question: '영화 보기',                       choices: ['영화관에서 꼭 봐야지', '집에서 편하게'] },
      { question: '산 vs 바다',                      choices: ['산 하이킹이 좋아', '바다 여행이 최고'] },
      { question: '카페 vs 공원',                    choices: ['카페에서 수다 삼매경', '공원에서 산책하며'] },
      { question: '음악 취향',                       choices: ['K-POP & 팝송', '인디 & 밴드 음악'] },
      { question: '콘서트 vs 페스티벌',               choices: ['좋아하는 가수 콘서트', '다양한 음악 페스티벌'] },
      { question: 'SNS 스타일',                      choices: ['자주 올리고 공유', '보는 걸 더 좋아함'] },
    ] as { question: string; choices: [string, string] }[];
  }
}
