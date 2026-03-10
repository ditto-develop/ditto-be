# Ditto Backend

> 디토(Ditto) 서비스의 백엔드 리포지토리입니다.
>
> 퀴즈 기반 1:1 매칭 플랫폼의 REST API 서버입니다.

---

## 서비스 개요

Ditto는 사용자가 매주 제공되는 퀴즈를 풀고, 응답 패턴이 비슷한 상대와 매칭되는 플랫폼입니다.

**핵심 플로우**
1. 사용자가 퀴즈에 답변
2. 유사도 기반 매칭 후보 추천
3. 매칭 요청 → 수락/거절
4. 채팅방 개설 및 대화

---

## API 엔드포인트

### 인증 / 사용자 (`/api/users`)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/users/login` | 이메일 로그인 |
| POST | `/api/users/social-login` | 소셜(카카오) 로그인 |
| POST | `/api/users/auth/refresh` | 액세스 토큰 재발급 |
| POST | `/api/users/auth/logout` | 로그아웃 |
| GET | `/api/users/me/profile` | 내 프로필 조회 |
| GET | `/api/users/{id}/profile` | 특정 유저 공개 프로필 조회 |
| PUT | `/api/users/me/intro-notes` | 자기소개 수정 |
| GET | `/api/users/nickname/{nickname}/availability` | 닉네임 중복 확인 |
| DELETE | `/api/users/{id}/leave` | 회원 탈퇴 |

### 퀴즈 (`/api/quizzes`, `/api/quiz-sets`)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/quizzes` | 퀴즈 목록 조회 |
| GET | `/api/quizzes/{id}` | 퀴즈 단건 조회 |
| GET | `/api/quiz-sets` | 퀴즈셋 목록 조회 |
| GET | `/api/quiz-sets/current-week` | 현재 주차 퀴즈셋 조회 |
| GET | `/api/quiz-sets/{id}` | 퀴즈셋 상세 조회 |

### 퀴즈 진행 (`/api/quiz-progress`)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/quiz-progress/answers` | 퀴즈 답변 제출 |
| GET | `/api/quiz-progress/current` | 현재 진행 상태 조회 |
| GET | `/api/quiz-progress/quiz-sets/{id}` | 특정 퀴즈셋 진행 현황 |
| POST | `/api/quiz-progress/reset` | 진행 초기화 |

### 매칭 (`/api/matches`)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/matches/1on1` | 1:1 매칭 후보 목록 조회 |
| POST | `/api/matches/request` | 매칭 요청 보내기 |
| POST | `/api/matches/request/{id}/accept` | 매칭 요청 수락 |
| POST | `/api/matches/request/{id}/reject` | 매칭 요청 거절 |
| GET | `/api/matching/status/{quizSetId}` | 매칭 현황 조회 (보낸/받은 요청) |

### 채팅 (`/api/chat`)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/chat/rooms` | 채팅방 목록 조회 |
| GET | `/api/chat/rooms/{roomId}/messages` | 채팅 메시지 조회 |
| POST | `/api/chat/rooms/{roomId}/read` | 메시지 읽음 처리 |

### 기타

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/health` | 서버 헬스체크 |
| GET | `/api/system/state` | 시스템 상태 조회 |

---

## API 응답 형식

모든 응답은 아래 구조로 래핑됩니다.

```json
{
  "success": true,
  "data": { ... }
}
```

에러 발생 시:

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

---

## 인증

JWT Bearer 토큰 방식을 사용합니다.

```
Authorization: Bearer <accessToken>
```

- 소셜 로그인(카카오) 후 발급된 `accessToken`을 헤더에 포함
- 토큰 만료 시 `/api/users/auth/refresh` 로 재발급

---

## 환경변수

`.env` 파일을 생성하고 아래 변수를 설정합니다.

```env
# 서버
PORT=8080
NODE_ENV=development

# 데이터베이스
DATABASE_URL=

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=

# 카카오 OAuth
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_REDIRECT_URI=https://ditto.pics/oauth/kakao
```

---

## 시작하기

### 패키지 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드 및 실행

```bash
npm run build
npm run start
```

---

## 배포

GitHub Actions 워크플로우를 통해 `main` 브랜치 푸시 시 AWS EC2에 자동 배포됩니다.

- API 서버 URL: [https://ditto.pics/api](https://ditto.pics/api)
- 헬스체크: [https://ditto.pics/health](https://ditto.pics/health)
