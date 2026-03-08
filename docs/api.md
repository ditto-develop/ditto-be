# Ditto API 문서

> Swagger UI: `GET /api/docs`
> Swagger JSON: `docs/ditto-api.json`

## 인증

모든 보호 엔드포인트는 `Authorization: Bearer <accessToken>` 헤더가 필요합니다.

```
POST /api/users/social-login   → { accessToken, refreshToken }
POST /api/users/auth/refresh    → { accessToken }
POST /api/users/auth/logout     → 쿠키 제거
```

## 에러 응답 형식

모든 에러는 아래 형식으로 반환됩니다:

```json
{
  "success": false,
  "error": {
    "message": "에러 메시지",
    "code": "BUSINESS_RULE_VIOLATION",
    "statusCode": 400
  },
  "timestamp": "2026-03-08T00:00:00.000Z",
  "path": "/api/..."
}
```

| code | statusCode | 설명 |
|------|------------|------|
| `ENTITY_NOT_FOUND` | 404 | 리소스를 찾을 수 없음 |
| `BUSINESS_RULE_VIOLATION` | 400 | 비즈니스 규칙 위반 |
| `VALIDATION_ERROR` | 400 | 입력값 유효성 검증 실패 |
| `UNAUTHORIZED` | 401 | 인증 실패 |
| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류 |

---

## Profile

### GET /api/users/me/profile
내 프로필 조회.

### PATCH /api/users/me/profile
내 프로필 수정.
```json
{ "introduction": "안녕하세요!", "preferredMinAge": 20, "preferredMaxAge": 30 }
```

### GET /api/users/:id/profile
타인 공개 프로필 조회. 민감 정보(email, phoneNumber) 제외.
탈퇴 사용자는 404 반환.

---

## Matching

### GET /api/matches/1on1
1:1 매칭 후보 조회. Hard filter + Score 기반 최대 5명.

**Hard Filter:**
- 퀴즈 미완료 제외
- 탈퇴 사용자 제외
- 나이 선호 범위 불일치 제외 (양방향)

**Score:** 퀴즈 답변 일치율 (0~100%)

### POST /api/matches/request
매칭 요청 전송.
```json
{ "toUserId": "...", "quizSetId": "..." }
```

### POST /api/matches/request/:id/accept
매칭 요청 수락. 수신자만 가능. 채팅방 자동 생성.

### POST /api/matches/request/:id/reject
매칭 요청 거절. 수신자만 가능.

### GET /api/matching/status/:quizSetId
해당 퀴즈셋에서의 매칭 현황 조회.

**상태 전이:**
```
PENDING → ACCEPTED | REJECTED | CANCELLED | EXPIRED
ACCEPTED / REJECTED / CANCELLED / EXPIRED → (종료, 변경 불가)
```

---

## Rating

### GET /api/users/:id/answers
상대 답변 비교 조회. **매칭 성사(ACCEPTED) 사용자만 가능.**

응답: 퀴즈별 내 선택 / 상대 선택 / 일치 여부 + 전체 일치율.

### GET /api/users/:id/ratings
사용자 평가 조회.

**공개 정책:** 누적 평가 3개 이상 시 평균 점수 + 개별 평가 공개. 미달 시 총 개수만 반환.

### POST /api/users/:id/ratings
평가 작성. **매칭 성사 당사자만 가능. 동일 매칭 건 중복 평가 불가.**
```json
{ "matchRequestId": "...", "score": 4, "comment": "좋은 대화였습니다!" }
```

| 제약 | 구현 |
|------|------|
| 매칭 당사자만 | UseCase에서 fromUser/toUser 확인 |
| 중복 평가 방지 | DB `@@unique([matchRequestId, fromUserId])` + UseCase 선행 체크 |
| 자기 자신 평가 | 도메인 엔티티에서 차단 |

---

## Chat

### GET /api/chat/rooms
내 채팅방 목록. 각 방의 최신 메시지, 안읽은 메시지 수 포함.

### POST /api/chat/rooms
채팅방 생성. 매칭 성사(ACCEPTED) 건 기반. 이미 존재하면 기존 방 반환.
```json
{ "matchRequestId": "..." }
```

### GET /api/chat/rooms/:roomId/messages
메시지 조회. **Cursor-based pagination.** 최신순.

| 파라미터 | 설명 |
|----------|------|
| `cursor` | 이전 응답의 `nextCursor` |
| `limit` | 조회 건수 (기본 30) |

응답:
```json
{
  "messages": [{ "id": "...", "senderId": "...", "content": "...", "createdAt": "..." }],
  "nextCursor": "msg-id-30"  // null이면 마지막 페이지
}
```

### POST /api/chat/rooms/:roomId/messages
메시지 전송. **참여자만 가능. 빈 메시지, 2000자 초과 차단.**
```json
{ "content": "안녕하세요!" }
```

### PATCH /api/chat/rooms/:roomId/read
읽음 처리. 현재 시각까지 모든 메시지를 읽음 처리.

**채팅방 생성 규칙:**
1. 매칭 수락 시 자동 생성 (AcceptMatchRequestUseCase)
2. 수동 생성 시 matchRequestId 기반
3. 동일 사용자 조합 + 동일 매칭 건 중복 방지 (기존 방 반환)

---

## 운영 정보

### DB 마이그레이션
```bash
pnpm prisma migrate dev        # 개발 환경
pnpm prisma migrate deploy     # 운영 환경
pnpm prisma db seed            # 시드 데이터
```

### Docker
```bash
docker build -t ditto-be .
docker run -p 4000:4000 --env-file .env ditto-be
```

### 환경 변수
| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | - |
| `JWT_ACCESS_SECRET` | JWT 서명 키 | - |
| `JWT_REFRESH_SECRET` | Refresh 서명 키 | - |
| `REDIS_HOST` | Redis 호스트 | localhost |
| `PORT` | 서버 포트 | 4000 |
