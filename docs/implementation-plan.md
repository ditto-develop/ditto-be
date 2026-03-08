# Ditto 백엔드 구현 계획서 (Implementation Plan)

> 작성일: 2026-03-08  
> 브랜치: `ai/chat-request`  
> 기준: `develop` 브랜치 코드베이스

---

## 1. 현재 상태 분석 (As-Is)

### 1-1. 기존 모듈

| 모듈 | 역할 | Controller | UseCase 수 | 비고 |
|------|------|-----------|-----------|------|
| **auth** | JWT Guard 설정 | - | - | 모듈만 존재, 로직은 user에 위임 |
| **user** | 유저 CRUD, 로그인, 소셜 로그인, 프로필 | `UserController` (16 endpoints) | 14 | 핵심 모듈 |
| **quiz** | 퀴즈 CRUD, 진행, 답변 제출 | `QuizSetController`, `QuizController`, `QuizProgressController` | 19 | 매칭 기초 데이터 제공 |
| **role** | 역할 관리 (SUPER_ADMIN, ADMIN, USER) | - | - | User에서 참조 |
| **system** | 시스템 상태/헬스체크 | 1 | 1 | 간단한 상태 API |
| **common** | Prisma, Redis, 공통 인프라 | - | - | DB/캐시 레이어 |

### 1-2. 기존 Prisma 모델

| 모델 | 주요 필드 | 관계 |
|------|----------|------|
| `User` | id, name, nickname, gender, age, birthDate | → Role, SocialAccount, QuizProgress |
| `Role` | id, name, code | → User[] |
| `UserSocialAccount` | provider, providerUserId | → User |
| `QuizSet` | year, month, week, category, matchingType | → Quiz[], QuizProgress[] |
| `Quiz` | question, order | → QuizSet, Choice[], Answer[] |
| `Choice` | text, order | → Quiz, Answer[] |
| `QuizAnswer` | userId, answeredAt | → Quiz, Choice |
| `UserQuizProgress` | status, selectedAt, completedAt | → User, QuizSet |

### 1-3. 기존 아키텍처 패턴

```
Controller → CommandBus.execute(Command) → Handler → UseCase → Repository(Interface) → Prisma
                                                        ↓
                                                  Domain Entity (불변, static create, update 메서드)
```

- **CommandBus**: 커스텀 구현, `registerCommandHandlers` 유틸로 모듈 초기화 시 등록
- **Repository**: Interface + Token Symbol 기반 DI (`USER_REPOSITORY_TOKEN`)
- **Domain Entity**: 불변 객체, `static create()` + `update()` 패턴
- **DTO**: `class-validator` 데코레이터 기반 검증
- **Swagger**: `@ApiTags`, `@ApiOperation`, `@ApiCommandResponse` 데코레이터
- **Guard**: `JwtAuthGuard` (전역 아님, Controller 레벨 적용)
- **Decorator**: `@CurrentUser()` 로 인증된 사용자 추출

---

## 2. 누락 항목 분석 (Missing)

### 필요한 신규 모듈

| 모듈 | 우선순위 | 목적 |
|------|---------|------|
| **profile** | ⭐ P1 | 자기소개 노트, 프로필 사진, 관심사/태그 관리 |
| **matching** | ⭐ P2 | 퀴즈 기반 1:1 매칭 알고리즘, 매칭 결과 저장 |
| **chat-request** | ⭐ P2 | 대화 신청/수락/거절 워크플로우 |
| **chat** | P3 | 실시간 1:1 채팅 (WebSocket/SSE) |
| **rating** | P3 | 대화 후 상대방 평가 |

### 필요한 신규 Prisma 모델

| 모델 | 핵심 필드 | 용도 |
|------|----------|------|
| `UserProfile` | bio, introNote, photoUrls, interests | P1: 자기소개 노트 |
| `MatchingResult` | quizSetId, user1Id, user2Id, score, status | P2: 매칭 결과 |
| `ChatRequest` | fromUserId, toUserId, matchingResultId, status | P2: 대화 신청 |
| `ChatRoom` | chatRequestId, status | P3: 채팅방 |
| `ChatMessage` | chatRoomId, senderId, content, type | P3: 채팅 메시지 |
| `UserRating` | fromUserId, toUserId, chatRoomId, score, comment | P3: 평가 |

---

## 3. DB 변경안 (Prisma Migration)

### Phase 1: Profile 모델

```prisma
model UserProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  bio       String?  @db.Text          // 한 줄 소개
  introNote String?  @db.Text          // 자기소개 노트 (긴 텍스트)
  photoUrls String[] @default([])      // 프로필 사진 URLs
  interests String[] @default([])      // 관심사 태그

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}
```

> User 모델에 `profile UserProfile?` 관계 추가 필요

### Phase 2: Matching + ChatRequest 모델

```prisma
enum MatchingStatus {
  PENDING       // 매칭 대기 중
  MATCHED       // 매칭 완료
  EXPIRED       // 만료
}

enum ChatRequestStatus {
  PENDING       // 신청 대기
  ACCEPTED      // 수락
  REJECTED      // 거절
  EXPIRED       // 만료
  CANCELLED     // 취소
}

model MatchingResult {
  id          String         @id @default(cuid())
  quizSetId   String
  user1Id     String
  user2Id     String
  score       Float          @default(0)   // 매칭 점수 (유사도)
  status      MatchingStatus @default(PENDING)
  matchedAt   DateTime       @default(now())

  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  quizSet      QuizSet       @relation(fields: [quizSetId], references: [id])
  user1        User          @relation("MatchUser1", fields: [user1Id], references: [id])
  user2        User          @relation("MatchUser2", fields: [user2Id], references: [id])
  chatRequests ChatRequest[]

  @@unique([quizSetId, user1Id, user2Id])
  @@map("matching_results")
}

model ChatRequest {
  id               String            @id @default(cuid())
  matchingResultId String
  fromUserId       String
  toUserId         String
  status           ChatRequestStatus @default(PENDING)
  message          String?           // 선택적 메시지

  requestedAt      DateTime          @default(now())
  respondedAt      DateTime?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  matchingResult MatchingResult @relation(fields: [matchingResultId], references: [id])
  fromUser       User           @relation("ChatRequestFrom", fields: [fromUserId], references: [id])
  toUser         User           @relation("ChatRequestTo", fields: [toUserId], references: [id])
  chatRoom       ChatRoom?

  @@map("chat_requests")
}
```

### Phase 3: Chat + Rating 모델

```prisma
enum ChatRoomStatus {
  ACTIVE
  CLOSED
  ARCHIVED
}

model ChatRoom {
  id            String         @id @default(cuid())
  chatRequestId String         @unique
  status        ChatRoomStatus @default(ACTIVE)

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  chatRequest ChatRequest  @relation(fields: [chatRequestId], references: [id])
  messages    ChatMessage[]
  ratings     UserRating[]

  @@map("chat_rooms")
}

model ChatMessage {
  id         String   @id @default(cuid())
  chatRoomId String
  senderId   String
  content    String   @db.Text
  type       String   @default("text")  // text, image, system
  isRead     Boolean  @default(false)

  createdAt  DateTime @default(now())

  chatRoom ChatRoom @relation(fields: [chatRoomId], references: [id], onDelete: Cascade)
  sender   User     @relation(fields: [senderId], references: [id])

  @@index([chatRoomId, createdAt])
  @@map("chat_messages")
}

model UserRating {
  id         String   @id @default(cuid())
  chatRoomId String
  fromUserId String
  toUserId   String
  score      Int      // 1-5
  comment    String?  @db.Text

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  chatRoom ChatRoom @relation(fields: [chatRoomId], references: [id])
  fromUser User     @relation("RatingFrom", fields: [fromUserId], references: [id])
  toUser   User     @relation("RatingTo", fields: [toUserId], references: [id])

  @@unique([chatRoomId, fromUserId])
  @@map("user_ratings")
}
```

---

## 4. API 계약안

### Phase 1: Profile API

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/profile/me` | 내 프로필 조회 |
| `PUT` | `/profile/me` | 내 프로필 수정 (bio, introNote, interests) |
| `POST` | `/profile/me/photos` | 프로필 사진 업로드 |
| `DELETE` | `/profile/me/photos/:index` | 프로필 사진 삭제 |
| `GET` | `/profile/:userId` | 타인 프로필 조회 (매칭된 사용자만) |

### Phase 2: Matching + ChatRequest API

| Method | Path | 설명 |
|--------|------|------|
| `POST` | `/matching/run` | 매칭 실행 (퀴즈셋 기준, 관리자) |
| `GET` | `/matching/my` | 내 매칭 결과 조회 |
| `GET` | `/matching/:id` | 매칭 상세 조회 |
| `POST` | `/chat-requests` | 대화 신청 (`{ matchingResultId }`) |
| `GET` | `/chat-requests/my` | 내 대화 신청 목록 (보낸/받은) |
| `PATCH` | `/chat-requests/:id/accept` | 대화 신청 수락 |
| `PATCH` | `/chat-requests/:id/reject` | 대화 신청 거절 |

### Phase 3: Chat API

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/chat-rooms/my` | 내 채팅방 목록 |
| `GET` | `/chat-rooms/:id/messages` | 메시지 목록 (페이지네이션) |
| `POST` | `/chat-rooms/:id/messages` | 메시지 전송 |
| `WS` | `/chat` | WebSocket 실시간 채팅 |
| `POST` | `/ratings` | 평가 작성 |
| `GET` | `/ratings/my` | 내 평가 조회 |

---

## 5. Phase별 작업 순서

### Phase 1: Profile 확장 (예상 2일)

- [ ] `UserProfile` Prisma 모델 추가 + migration
- [ ] `User` → `UserProfile` 관계 추가
- [ ] `profile` 모듈 생성 (domain/entity, repository, usecase, controller)
- [ ] Profile CRUD API 구현
- [ ] 프로필 사진 업로드 (S3/로컬 저장소)
- [ ] FE 프로필 편집 화면 연동

### Phase 2: Matching + ChatRequest (예상 3일)

- [ ] `MatchingResult`, `ChatRequest` Prisma 모델 추가 + migration
- [ ] `matching` 모듈 생성
- [ ] 매칭 알고리즘 구현 (퀴즈 답변 유사도 기반)
- [ ] `chat-request` 모듈 생성
- [ ] 대화 신청/수락/거절 API 구현
- [ ] FE 대화 신청 플로우 연동 (현재 UI 하드코딩 → API 연결)

### Phase 3: Chat + Rating (예상 4일)

- [ ] `ChatRoom`, `ChatMessage`, `UserRating` Prisma 모델 추가 + migration
- [ ] `chat` 모듈 생성 (REST + WebSocket Gateway)
- [ ] 실시간 메시지 송수신 구현
- [ ] `rating` 모듈 생성
- [ ] FE 채팅 UI + 평가 화면 구현

---

## 6. 리스크 및 마이그레이션 포인트

### ⚠️ 리스크

| 항목 | 등급 | 설명 | 완화 방안 |
|------|-----|------|----------|
| DB Migration | 🟡 중 | 신규 테이블 6개 추가, User 모델에 relation 추가 | 신규 테이블만 추가하므로 기존 데이터 영향 없음. `prisma migrate dev`로 로컬 선검증 |
| User 모델 변경 | 🟡 중 | `UserProfile` relation 추가 시 User 조회 쿼리 변경 | `include` 옵션으로 lazy loading 유지 |
| 매칭 알고리즘 정확도 | 🟠 높 | 퀴즈 답변 기반 유사도 계산 로직 부재 | 단순 일치율 → 가중치 방식으로 점진 개선 |
| WebSocket 인프라 | 🟡 중 | 현재 HTTP only, WS Gateway 추가 필요 | NestJS `@WebSocketGateway` 활용, Phase 3에서 도입 |
| 파일 업로드 | 🟢 낮 | 프로필 사진 저장소 미정 | Phase 1에서 로컬 저장 → Phase 3에서 S3 전환 |

### 🔄 마이그레이션 포인트

1. **User ↔ UserProfile 분리**: 기존 User 테이블은 그대로 유지하고, 프로필 정보만 별도 테이블로 분리. 기존 `name`, `nickname`, `gender`, `age` 등은 User에 잔류.
2. **QuizSet.matchingType 활용**: 이미 `ONE_TO_ONE | GROUP` enum이 존재하므로 매칭 알고리즘에서 이를 활용.
3. **UserQuizProgress → MatchingResult 연계**: 퀴즈 완료(`COMPLETED`) 상태인 사용자들만 매칭 대상. `QuizAnswer`에서 답변 데이터 추출하여 유사도 계산.

---

## 7. 핵심 결정사항

1. **프로필을 별도 테이블로 분리** — User 테이블 비대화 방지, 프로필 정보의 독립적 CRUD 보장
2. **매칭은 QuizSet 단위로 실행** — 주차별 퀴즈 완료 사용자 대상, 관리자가 수동 트리거 또는 cron 자동 실행
3. **대화 신청은 MatchingResult 기반** — 매칭된 상대에게만 대화 신청 가능 (무차별 신청 방지)
4. **Phase 순서 엄수** — Profile → Matching → Chat 순서로 의존성 해결
5. **코드 패턴 통일** — 기존 `CommandBus + UseCase + Repository Interface` 패턴 그대로 따름

---

## 8. 다음 Phase (Phase 1)에서 바로 착수할 작업

1. `prisma/schema.prisma`에 `UserProfile` 모델 추가 + User relation 보강
2. `prisma migrate dev --name add-user-profile` 실행
3. `src/modules/profile/` 디렉토리 생성 (domain, application, infrastructure, presentation)
4. `ProfileController` + `GetMyProfile`, `UpdateMyProfile` UseCase 구현
5. `app.module.ts`에 `ProfileModule` 등록
