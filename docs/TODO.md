# 운영 TODO

## 우선순위: 높음

### WebSocket 채팅 확장
- `src/modules/chat/presentation/gateway/chat.gateway.ts` 에 `@WebSocketGateway` 추가
- 기존 `SendMessageUseCase`, `MarkAsReadUseCase` 재사용
- 이벤트: `message:send`, `message:read`, `room:typing`
- Socket.IO 또는 WS 어댑터 선택

### 매칭 후보 사전 계산 (Cron/BullMQ)
- 현재: 매칭 후보를 매 요청마다 실시간 계산
- 개선: 퀴즈 제출 완료 시 or Cron(주 1회)으로 후보 테이블에 사전 계산
- 스켈레톤:
  ```typescript
  // src/modules/matching/application/jobs/precompute-candidates.job.ts
  @Injectable()
  export class PrecomputeCandidatesJob {
      @Cron('0 0 * * 1') // 매주 월요일 자정
      async handleCron() {
          // 1. 현재 주차 COMPLETED 사용자 조회
          // 2. 모든 조합에 대해 점수 계산
          // 3. match_candidates 테이블에 캐시
      }
  }
  ```

### 매칭 요청 만료 처리 (Cron)
- PENDING 상태 매칭 요청이 7일 경과 시 EXPIRED로 전이
- 스켈레톤:
  ```typescript
  @Cron('0 */6 * * *') // 6시간마다
  async expireStaleRequests() {
      // UPDATE match_requests SET status = 'EXPIRED'
      // WHERE status = 'PENDING' AND requestedAt < NOW() - INTERVAL '7 days'
  }
  ```

## 우선순위: 중간

### Push 알림
- 매칭 요청 수신, 수락/거절, 새 메시지 시 알림
- FCM 또는 APNs 연동

### 채팅 메시지 soft delete API
- `ChatMessage.deletedAt` 컬럼은 준비 완료
- `DELETE /api/chat/rooms/:roomId/messages/:messageId` 엔드포인트 추가

### 파일/이미지 메시지
- `ChatMessage`에 `type` (TEXT, IMAGE, FILE) 필드 추가
- S3/R2 연동

### 사용자 신고/차단
- 매칭/채팅에서 부적절한 사용자 신고
- 차단 시 매칭 후보에서 제외

## 우선순위: 낮음

### 매칭 알고리즘 v2
- 현재 v1: 순수 퀴즈 일치율
- v2 후보: 가중치 적용, 카테고리별 일치율, 성향 기반 보완 매칭

### 그룹 매칭
- `QuizSet.matchingType = GROUP` 지원
- 3~5명 그룹 채팅방 생성

### 성능 모니터링
- DB slow query 로깅
- API 응답시간 메트릭 (Prometheus + Grafana)

## 완료된 항목

- [x] Profile CRUD (PHASE 2)
- [x] 1:1 매칭 후보 조회/요청/수락/거절 (PHASE 2)
- [x] 답변 비교 + 일치율 (PHASE 3)
- [x] 평가 작성/조회 + 공개 정책 (PHASE 3)
- [x] Direct chat room/message/읽음 처리 (PHASE 4)
- [x] N+1 쿼리 개선 - 매칭 후보 조회 batch 로딩 (PHASE 5)
- [x] 탈퇴 사용자 프로필 조회 방지 (PHASE 5)
- [x] 도메인 엔티티 테스트 보강 (PHASE 5)
- [x] API 문서 작성 (PHASE 5)
