# 관리자용 프로젝트 API 가이드

> 프론트엔드 개발자와 디자이너를 위한 Ditto 관리자 시스템 API 문서

## 목차

1. [기본 정보](#기본-정보)
2. [인증 및 인가](#인증-및-인가)
3. [도메인별 API](#도메인별-api)
   - [사용자 관리 (Users)](#사용자-관리-users)
   - [퀴즈 관리 (Quizzes)](#퀴즈-관리-quizzes)
   - [퀴즈 세트 관리 (Quiz Sets)](#퀴즈-세트-관리-quiz-sets)
   - [역할 관리 (Roles)](#역할-관리-roles)
   - [시스템 상태 (System)](#시스템-상태-system)
4. [공통 응답 형식](#공통-응답-형식)
5. [에러 처리](#에러-처리)
6. [사용 흐름 예시](#사용-흐름-예시)

---

## 기본 정보

### API 기본 URL

- **개발 환경**: `http://localhost:4000`
- **운영 환경**: `https://www.ditto.pics`

### API Prefix

모든 API 경로는 `/api`로 시작합니다.

예: `POST /api/users/login`

### Content-Type

- **요청**: `application/json`
- **응답**: `application/json`

---

## 인증 및 인가

### 인증 방식

JWT Bearer Token 방식을 사용합니다.

### 권한 레벨

시스템에는 세 가지 역할이 있습니다:

- **SUPER_ADMIN**: 최고 관리자 (모든 권한)
- **ADMIN**: 관리자 (대부분의 관리 권한)
- **USER**: 일반 사용자 (자신의 정보만 관리)

**권한 계층 구조**: SUPER_ADMIN > ADMIN > USER

### 인증 흐름

#### 1. 관리자 로그인

```http
POST /api/users/login
Content-Type: application/json

{
  "username": "admin",
  "password": "1234"
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id-123",
      "name": "홍길동",
      "nickname": "최고관리자",
      "role": {
        "id": 1,
        "code": "SUPER_ADMIN",
        "name": "최고 관리자"
      }
    }
  }
}
```

**중요**: `refreshToken`은 자동으로 쿠키에 설정됩니다. (`refreshToken` 쿠키)

#### 2. API 호출 시 인증

인증이 필요한 API 호출 시 `Authorization` 헤더에 액세스 토큰을 포함합니다:

```http
GET /api/users
Authorization: Bearer {accessToken}
```

#### 3. 토큰 갱신

액세스 토큰이 만료되면 (보통 15분), 쿠키에 저장된 `refreshToken`을 사용하여 새 토큰을 발급받습니다:

```http
POST /api/users/auth/refresh
```

**쿠키 자동 전송**: 브라우저가 자동으로 `refreshToken` 쿠키를 전송합니다.

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "accessToken": "새로운-액세스-토큰",
    "user": { ... }
  }
}
```

#### 4. 로그아웃

```http
POST /api/users/auth/logout
```

**쿠키 자동 삭제**: `refreshToken` 쿠키가 자동으로 삭제됩니다.

---

## 공통 응답 형식

모든 API는 다음과 같은 공통 응답 형식을 사용합니다:

### 성공 응답

```json
{
  "success": true,
  "data": {
    // 실제 데이터
  }
}
```

### 실패 응답

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

### 강제 적용 패스워드 (Force Password)

시스템의 비즈니스 규칙 제약(과거 날짜 수정 불가, 중복 주차 생성 불가 등)을 우회하여 작업을 강제 실행해야 할 경우 사용하는 패스워드입니다.

- **사용**: 생성/수정/삭제 API의 요청 파라미터(`forcePassword`)에 포함하여 전송합니다.

### HTTP 상태 코드

- `200 OK`: 요청 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청 (유효성 검사 실패 등)
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 부족
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

## 도메인별 API

### 사용자 관리 (Users)

#### 1. 관리자 계정 생성

**엔드포인트**: `POST /api/users/admin`

**권한**: `ADMIN`, `SUPER_ADMIN`

**요청 본문:**
```json
{
  "name": "홍길동",
  "nickname": "관리자1",
  "phoneNumber": "01012345678",
  "email": "admin@example.com",
  "username": "admin2",
  "password": "securePassword123",
  "gender": "MALE",
  "age": 30,
  "birthDate": "1996-11-30",
  "roleId": 2
}
```

**필드 설명:**
- `name`: 이름 (필수)
- `nickname`: 닉네임 (필수)
- `phoneNumber`: 전화번호 (필수)
- `email`: 이메일 (선택)
- `username`: 관리자 사용자명 (필수)
- `password`: 비밀번호 (필수)
- `gender`: 성별 - `MALE` 또는 `FEMALE` (필수)
- `age`: 나이 (필수, 0-150)
- `birthDate`: 생년월일 (선택, 형식: YYYY-MM-DD)
- `roleId`: 역할 ID (필수, 1: SUPER_ADMIN, 2: ADMIN)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "user-id-123",
    "name": "홍길동",
    "nickname": "관리자1",
    "phoneNumber": "01012345678",
    "email": "admin@example.com",
    "gender": "MALE",
    "age": 30,
    "birthDate": "1996-11-30T00:00:00.000Z",
    "joinedAt": "2025-01-01T00:00:00.000Z",
    "leftAt": null,
    "role": {
      "id": 2,
      "code": "ADMIN",
      "name": "관리자"
    },
    "socialAccounts": [],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 2. 모든 사용자 조회

**엔드포인트**: `GET /api/users`

**권한**: `ADMIN`, `SUPER_ADMIN`

**쿼리 파라미터**: 없음

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id-123",
      "name": "홍길동",
      "nickname": "관리자1",
      "phoneNumber": "01012345678",
      "email": "admin@example.com",
      "gender": "MALE",
      "age": 30,
      "role": { ... },
      "socialAccounts": [ ... ]
    },
    ...
  ]
}
```

#### 3. 사용자 상세 조회

**엔드포인트**: `GET /api/users/{id}`

**권한**: `ADMIN`, `SUPER_ADMIN`, `USER` (본인 정보만)

**경로 파라미터:**
- `id`: 사용자 ID (string)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "user-id-123",
    "name": "홍길동",
    ...
  }
}
```

#### 4. 본인 정보 조회

**엔드포인트**: `GET /api/users/me/profile`

**권한**: 인증된 모든 사용자

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "user-id-123",
    "name": "홍길동",
    ...
  }
}
```

#### 5. 사용자 정보 수정

**엔드포인트**: `PATCH /api/users/{id}`

**권한**: `ADMIN`, `SUPER_ADMIN`, `USER` (본인 정보만)

**요청 본문:**
```json
{
  "name": "홍길동",
  "nickname": "새로운닉네임",
  "phoneNumber": "01098765432",
  "email": "newemail@example.com"
}
```

**필드 설명:**
- 모든 필드는 선택 사항입니다.
- 수정하려는 필드만 포함하면 됩니다.

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "user-id-123",
    "name": "홍길동",
    "nickname": "새로운닉네임",
    ...
  }
}
```

#### 6. 사용자 삭제

**엔드포인트**: `DELETE /api/users/{id}`

**권한**: `ADMIN`, `SUPER_ADMIN`

**경로 파라미터:**
- `id`: 사용자 ID (string)

**응답 예시:**
```json
{
  "success": true
}
```

#### 7. 사용자 탈퇴

**엔드포인트**: `POST /api/users/{id}/leave`

**권한**: `USER` (본인만)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "user-id-123",
    "leftAt": "2025-01-01T00:00:00.000Z",
    ...
  }
}
```

---

### 퀴즈 관리 (Quizzes)

#### 1. 퀴즈 생성

**엔드포인트**: `POST /api/quizzes`

**권한**: 인증 필요 (권한 제한 없음)

**요청 본문:**
```json
{
  "id": "quiz-id-123",
  "question": "사과 vs 바나나",
  "quizSetId": "quiz-set-id-123",
  "choices": [
    {
      "content": "사과"
    },
    {
      "content": "바나나"
    }
  ],
  "order": 1
}
```

**필드 설명:**
- `id`: 퀴즈 ID (필수, UUID 또는 CUID 형식)
- `question`: 퀴즈 질문 (필수)
- `quizSetId`: 퀴즈 세트 ID (필수)
- `choices`: 선택지 배열 (필수, 정확히 2개)
  - `content`: 선택지 내용 (필수, 최대 500자)
- `order`: 퀴즈 순서 (선택, 미지정 시 자동 할당)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "quiz-id-123",
    "question": "사과 vs 바나나",
    "quizSetId": "quiz-set-id-123",
    "choices": [
      {
        "id": "choice-id-1",
        "content": "사과",
        "order": 1
      },
      {
        "id": "choice-id-2",
        "content": "바나나",
        "order": 2
      }
    ],
    "order": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 2. 퀴즈 조회

**엔드포인트**: `GET /api/quizzes/{id}`

**권한**: 인증 필요 없음

**경로 파라미터:**
- `id`: 퀴즈 ID (string)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "quiz-id-123",
    "question": "사과 vs 바나나",
    ...
  }
}
```

#### 3. 퀴즈 수정

**엔드포인트**: `PUT /api/quizzes/{id}`

**권한**: 인증 필요 (권한 제한 없음)

**요청 본문:**
```json
{
  "question": "가장 좋아하는 과일은?",
  "choices": [
    {
      "id": "choice-id-1",
      "content": "사과"
    },
    {
      "id": "choice-id-2",
      "content": "바나나"
    }
  ],
  "order": 2
}
```

**필드 설명:**
- 모든 필드는 선택 사항입니다.
- `choices`를 수정할 경우, 정확히 2개를 제공하고 각 선택지에 `id`를 포함해야 합니다.

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "quiz-id-123",
    "question": "가장 좋아하는 과일은?",
    ...
  }
}
```

#### 4. 퀴즈 삭제

**엔드포인트**: `DELETE /api/quizzes/{id}`

**권한**: 인증 필요 (권한 제한 없음)

**응답 예시:**
```json
{
  "success": true
}
```

#### 9. 퀴즈 순서 일괄 변경 및 관리

**엔드포인트**: `PATCH /api/quiz-sets/{id}/reorder`

**권한**: 인증 필요 (권한 제한 없음)

**요청 본문:**
```json
{
  "quizIds": [
    "quiz-id-1",
    "quiz-id-2",
    "quiz-id-3"
  ]
}
```

**필드 설명:**
- `quizIds`: 순서대로 정렬된 퀴즈 ID 배열 (필수, 최소 1개 이상)

**비즈니스 규칙:**
- 전달된 배열의 인덱스 순서대로 `order`가 1부터 재할당됩니다.
- **중요**: 배열에 포함되지 않은 해당 퀴즈 세트의 기존 퀴즈들은 **자동으로 삭제**됩니다.
- 유효하지 않은 퀴즈 ID나 다른 세트의 퀴즈 ID가 포함된 경우 수정에 실패합니다.

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "quiz-set-id-123",
    "title": "1주차 일상 퀴즈",
    ...
  }
}
```

---

### 퀴즈 세트 관리 (Quiz Sets)

#### 1. 퀴즈 세트 생성

**엔드포인트**: `POST /api/quiz-sets`

**권한**: 인증 필요 (권한 제한 없음)

**요청 본문:**
```json
{
  "year": 2025,
  "month": 12,
  "week": 1,
  "category": "일상",
  "title": "1주차 일상 퀴즈",
  "description": "일상생활에 관한 퀴즈 세트입니다.",
  "startDate": "2025-12-01T00:00:00Z",
  "forcePassword": "forcePassword"
}
```

**필드 설명:**
- `year`: 년도 (필수, 최소 2000)
- `month`: 월 (필수, 1-12)
- `week`: 주차 (필수, 최소 1)
- `category`: 카테고리 (필수)
- `title`: 퀴즈 세트 제목 (필수)
- `description`: 설명 (선택)
- `startDate`: 시작일 (필수, ISO 8601 형식)
- `forcePassword`: 강제 적용 패스워드 (선택)
- 종료일(`endDate`)은 자동으로 시작일 + 7일로 설정됩니다.

**비즈니스 규칙:**
- **강제 적용 패스워드**가 유효하면 아래 모든 제약을 우회합니다.
- 동일한 년/월/주차/카테고리에 이미 퀴즈 세트가 존재하면 생성할 수 없습니다.
- `startDate`(시작일)는 현재 시각 이후여야 합니다.

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "quiz-set-id-123",
    "year": 2025,
    "month": 12,
    "week": 1,
    "category": "일상",
    "title": "1주차 일상 퀴즈",
    "description": "일상생활에 관한 퀴즈 세트입니다.",
    "startDate": "2025-12-01T00:00:00Z",
    "endDate": "2025-12-08T00:00:00Z",
    "isActive": false,
    "createdAt": "2025-11-29T12:00:00Z",
    "updatedAt": "2025-11-29T12:00:00Z"
  }
}
```

#### 2. 퀴즈 세트 목록 조회

**엔드포인트**: `GET /api/quiz-sets`

**권한**: 인증 필요 없음

**쿼리 파라미터:**
- `year`: 년도 필터 (선택, number, 최소 2000)
- `month`: 월 필터 (선택, number, 1-12)
- `week`: 주차 필터 (선택, number)
- `category`: 카테고리 필터 (선택, string)
- `isActive`: 활성화 여부 필터 (선택, boolean)

**예시:**
```
GET /api/quiz-sets?year=2025&month=12&week=1&category=일상&isActive=true
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "years": [
      {
        "year": 2025,
        "months": [
          {
            "month": 12,
            "weeks": [
              {
                "week": 1,
                "startDate": "2025-12-01T00:00:00Z",
                "endDate": "2025-12-07T23:59:59.999Z",
                "categories": [
                  {
                    "category": "일상",
                    "quizSets": [
                      {
                        "id": "quiz-set-id-123",
                        "year": 2025,
                        "month": 12,
                        "week": 1,
                        "category": "일상",
                        "title": "1주차 일상 퀴즈",
                        "description": "일상생활에 관한 퀴즈 세트입니다.",
                        "startDate": "2025-12-01T00:00:00Z",
                        "endDate": "2025-12-08T00:00:00Z",
                        "isActive": false
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**응답 구조 설명:**
- `years`: 년도별 그룹 배열 (오름차순 정렬)
  - `year`: 년도
  - `months`: 월별 그룹 배열 (오름차순 정렬)
    - `month`: 월 (1-12)
    - `weeks`: 주차별 그룹 배열 (오름차순 정렬)
      - `week`: 주차
      - `startDate`: 주차 시작일 (월요일)
      - `endDate`: 주차 종료일 (일요일 23:59:59.999)
      - `categories`: 카테고리별 그룹 배열 (알파벳 순 정렬)
        - `category`: 카테고리명
        - `quizSets`: 퀴즈 세트 배열 (타임스탬프 `createdAt`, `updatedAt` 제외)

**참고사항:**
- `year`와 `month`를 함께 지정하면, 해당 월의 모든 주차가 응답에 포함됩니다 (데이터가 없는 주차도 포함).
- `week` 파라미터를 함께 사용하면 특정 주차만 필터링됩니다.
- 필터를 지정하지 않으면 모든 퀴즈 세트가 계층 구조로 반환됩니다.

#### 3. 퀴즈 세트 조회

**엔드포인트**: `GET /api/quiz-sets/{id}`

**권한**: 인증 필요 없음

**경로 파라미터:**
- `id`: 퀴즈 세트 ID (string)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "quiz-set-id-123",
    "year": 2025,
    "month": 12,
    "week": 1,
    "category": "일상",
    "title": "1주차 일상 퀴즈",
    "description": "일상생활에 관한 퀴즈 세트입니다.",
    "startDate": "2025-12-01T00:00:00Z",
    "endDate": "2025-12-08T00:00:00Z",
    "isActive": false,
    "createdAt": "2025-11-29T12:00:00Z",
    "updatedAt": "2025-11-29T12:00:00Z",
    "quizzes": [
      {
        "id": "quiz-id-1",
        "question": "사과 vs 바나나",
        "quizSetId": "quiz-set-id-123",
        "order": 1,
        "choices": [
          { "id": "choice-1", "content": "사과", "order": 1 },
          { "id": "choice-2", "content": "바나나", "order": 2 }
        ],
        "createdAt": "2025-11-29T12:00:00Z",
        "updatedAt": "2025-11-29T12:00:00Z"
      }
    ]
  }
}
```

**필드 설명:**
- `quizzes`: 퀴즈 세트에 포함된 퀴즈 목록 (순서 `order` 기준 정렬)

#### 4. 퀴즈 세트 수정

**엔드포인트**: `PUT /api/quiz-sets/{id}`

**권한**: 인증 필요 (권한 제한 없음)

**요청 본문:**
```json
{
  "year": 2025,
  "month": 12,
  "week": 2,
  "category": "취미",
  "title": "2주차 취미 퀴즈",
  "description": "취미에 관한 퀴즈 세트입니다.",
  "startDate": "2025-12-08T00:00:00Z",
  "isActive": true,
  "forcePassword": "forcePassword"
}
```

**필드 설명:**
- 모든 필드는 선택 사항입니다.
- `forcePassword`: 강제 적용 패스워드 (선택)
- `startDate`를 변경하면 `endDate`도 자동으로 변경됩니다 (시작일 + 7일).

**비즈니스 규칙:**
- **강제 적용 패스워드**가 유효하면 아래 모든 제약을 우회합니다.
- **활성화 상태**(`isActive: true`)이며 **시작일이 오늘 이전**(오늘 포함)인 퀴즈 세트는 수정할 수 없습니다.
- 년/월/주차/카테고리 변경 시, 변경하려는 위치에 이미 다른 퀴즈 세트가 존재하면 수정할 수 없습니다.
- `startDate`(시작일) 변경 시, 현재 시각 이후여야 합니다.

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "quiz-set-id-123",
    "year": 2025,
    "month": 12,
    "week": 2,
    "category": "취미",
    "title": "2주차 취미 퀴즈",
    "isActive": true,
    ...
  }
}
```

#### 5. 퀴즈 세트 삭제

**엔드포인트**: `DELETE /api/quiz-sets/{id}`

**권한**: 인증 필요 (권한 제한 없음)

**쿼리 파라미터:**
- `forcePassword`: 강제 적용 패스워드 (선택)

**비즈니스 규칙:**
- **강제 적용 패스워드**가 유효하면 아래 모든 제약을 우회합니다.
- **활성화 상태**(`isActive: true`)이며 **시작일이 오늘 이전**(오늘 포함)인 퀴즈 세트는 삭제할 수 없습니다.
- 퀴즈 세트에 속한 퀴즈가 1개 이상 존재하면 삭제할 수 없습니다. 먼저 모든 퀴즈를 삭제해야 합니다.

**응답 예시:**
```json
{
  "success": true
}
```

#### 6. 퀴즈 세트 활성화

**엔드포인트**: `POST /api/quiz-sets/{id}/activate`

**권한**: 인증 필요 (권한 제한 없음)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "quiz-set-id-123",
    "isActive": true,
    ...
  }
}
```

#### 7. 퀴즈 세트 비활성화

**엔드포인트**: `POST /api/quiz-sets/{id}/deactivate`

**권한**: 인증 필요 (권한 제한 없음)

**응답 예시:**
```json
{
  "success": true
}
```

#### 8. 이번 주차 퀴즈 세트 조회

**엔드포인트**: `GET /api/quiz-sets/current-week`

**권한**: 인증 필요 없음

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "year": 2025,
    "month": 12,
    "week": 1,
    "quizSets": [
      {
        "id": "quiz-set-id-123",
        "year": 2025,
        "month": 12,
        "week": 1,
        "category": "금융",
        "title": "1주차 금융 퀴즈",
        "description": "금융에 관한 퀴즈 세트입니다.",
        "startDate": "2025-12-01T00:00:00Z",
        "endDate": "2025-12-08T00:00:00Z",
        "isActive": true,
        "quizzes": [
          {
            "id": "quiz-id-1",
            "question": "금리 vs 은리",
            "quizSetId": "quiz-set-id-123",
            "order": 1,
            "choices": [
              { "id": "choice-1", "content": "금리", "order": 1 },
              { "id": "choice-2", "content": "은리", "order": 2 }
            ],
            "createdAt": "2025-11-29T12:00:00Z",
            "updatedAt": "2025-11-29T12:00:00Z"
          }
        ]
      }
    ]
  }
}
```

**필드 설명:**
- `year`: 현재 시스템 년도
- `month`: 현재 시스템 월
- `week`: 현재 시스템 주차
- `quizSets`: 해당 주차의 카테고리별 퀴즈 세트 목록 (카테고리명 기준 정렬)
- `quizzes`: 각 퀴즈 세트에 포함된 퀴즈 목록 (순서 `order` 기준 정렬, 타임스탬프 `createdAt`, `updatedAt` 제외)

---

### 역할 관리 (Roles)

#### 1. 모든 역할 조회

**엔드포인트**: `GET /api/roles`

**권한**: 인증 필요 없음

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "SUPER_ADMIN",
      "name": "최고 관리자",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "code": "ADMIN",
      "name": "관리자",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": 3,
      "code": "USER",
      "name": "사용자",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2. 역할 조회

**엔드포인트**: `GET /api/roles/{id}`

**권한**: 인증 필요 없음

**경로 파라미터:**
- `id`: 역할 ID (number)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "SUPER_ADMIN",
    "name": "최고 관리자",
    ...
  }
}
```

---

### 시스템 상태 (System)

#### 1. 시스템 상태 조회

**엔드포인트**: `GET /api/system/state`

**권한**: 인증된 모든 사용자

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "week": 51,
    "period": "QUIZ_PERIOD"
  }
}
```

**필드 설명:**
- `week`: 현재 주차 (number)
- `period`: 현재 시스템 기간 상태 (enum)
  - `QUIZ_PERIOD`: 퀴즈 기간 (월~수)
  - `MATCHING_PERIOD`: 매칭 기간 (목)
  - `CHATTING_PERIOD`: 채팅 기간 (금~일)

---

## 에러 처리

### 공통 에러 응답

모든 에러는 다음과 같은 형식으로 반환됩니다:

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

### 주요 에러 케이스

#### 1. 인증 실패 (401)
```json
{
  "success": false,
  "error": "유효하지 않은 토큰입니다."
}
```

**조치 방법**: 로그인 API를 다시 호출하여 새로운 토큰을 발급받습니다.

#### 2. 권한 부족 (403)
```json
{
  "success": false,
  "error": "접근 권한이 없습니다."
}
```

**조치 방법**: 필요한 권한을 가진 계정으로 로그인합니다.

#### 3. 리소스를 찾을 수 없음 (404)
```json
{
  "success": false,
  "error": "사용자를 찾을 수 없습니다."
}
```

**조치 방법**: 올바른 ID를 사용했는지 확인합니다.

#### 4. 유효성 검사 실패 (400)
```json
{
  "success": false,
  "error": "잘못된 요청입니다."
}
```

**조치 방법**: 요청 본문의 필드 형식과 필수 필드를 확인합니다.

---

## 사용 흐름 예시

### 시나리오 1: 관리자 로그인 및 사용자 목록 조회

```javascript
// 1. 로그인
const loginResponse = await fetch('https://www.ditto.pics/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // 쿠키 자동 포함
  body: JSON.stringify({
    username: 'admin',
    password: '1234'
  })
});

const loginData = await loginResponse.json();
const accessToken = loginData.data.accessToken;

// 2. 사용자 목록 조회
const usersResponse = await fetch('https://www.ditto.pics/api/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  credentials: 'include',
});

const usersData = await usersResponse.json();
console.log(usersData.data); // 사용자 목록
```

### 시나리오 2: 퀴즈 세트 생성 및 퀴즈 추가

```javascript
// 1. 퀴즈 세트 생성
const quizSetResponse = await fetch('https://www.ditto.pics/api/quiz-sets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    year: 2025,
    month: 12,
    week: 1,
    category: '일상',
    title: '1주차 일상 퀴즈',
    description: '일상생활에 관한 퀴즈 세트입니다.',
    startDate: '2025-12-01T00:00:00Z'
  })
});

const quizSetData = await quizSetResponse.json();
const quizSetId = quizSetData.data.id;

// 2. 퀴즈 추가
const quizResponse = await fetch('https://www.ditto.pics/api/quizzes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    id: 'quiz-id-123',
    question: '사과 vs 바나나',
    quizSetId: quizSetId,
    choices: [
      { content: '사과' },
      { content: '바나나' }
    ],
    order: 1
  })
});

const quizData = await quizResponse.json();
console.log(quizData.data); // 생성된 퀴즈
```

### 시나리오 3: 토큰 만료 시 자동 갱신

```javascript
// API 호출 래퍼 함수 (자동 토큰 갱신)
async function apiCall(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  // 토큰 만료 시 자동 갱신
  if (response.status === 401) {
    const refreshResponse = await fetch('https://www.ditto.pics/api/users/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    
    const refreshData = await refreshResponse.json();
    accessToken = refreshData.data.accessToken;

    // 원래 요청 재시도
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  }

  return response;
}
```

---

## 주의사항

1. **쿠키 설정**: 모든 요청에 `credentials: 'include'` 옵션을 포함하여 쿠키가 자동으로 전송되도록 합니다.

2. **토큰 갱신**: 액세스 토큰은 약 15분 후 만료됩니다. 만료 시 자동으로 갱신하는 로직을 구현하세요.

3. **에러 처리**: 모든 API 호출에 대해 `success` 필드를 확인하고, 실패 시 `error` 메시지를 사용자에게 표시하세요.

4. **권한 확인**: 관리자 전용 기능은 `ADMIN` 또는 `SUPER_ADMIN` 권한이 필요합니다. 사용자의 역할을 확인하여 UI를 제어하세요.

5. **날짜 형식**: 날짜는 ISO 8601 형식(`YYYY-MM-DDTHH:mm:ssZ`)을 사용합니다.

---

## 추가 리소스

- **Swagger 문서** (개발 환경): `http://localhost:4000/docs`
- **API 스펙 파일**: `docs/ditto-api.json`

---

**문서 버전**: 1.0.0  
**마지막 업데이트**: 2025-01-01
