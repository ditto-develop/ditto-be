# 퀴즈 순서 일괄 변경 및 관리 (Reorder Quizzes)

## 개요
퀴즈 세트에 속한 퀴즈들의 순서를 배열로 전달받아 한 번에 업데이트하고, 배열에 포함되지 않은 퀴즈를 자동으로 삭제하는 기능입니다.

## 구성 요소

### 1. Presentation Layer
- **Controller**: `src/modules/quiz/presentation/controller/quiz-set.controller.ts` (`PATCH /api/quiz-sets/:id/reorder`)
- **Command**: `src/modules/quiz/presentation/commands/reorder-quizzes.command.ts`
- **Handler**: `src/modules/quiz/presentation/commands/handlers/reorder-quizzes.handler.ts`

### 2. Application Layer
- **UseCase**: `src/modules/quiz/application/usecases/reorder-quizzes.usecase.ts`
- **DTO**: `src/modules/quiz/application/dto/reorder-quizzes.dto.ts`

### 3. Infrastructure Layer
- **Repository Interface**: `src/modules/quiz/infrastructure/repository/quiz.repository.interface.ts`
- **Repository Implementation**: `src/modules/quiz/infrastructure/repository/quiz.repository.ts`

## 비즈니스 로직
1. 퀴즈 세트의 존재 여부를 확인합니다.
2. 전달받은 `quizIds` 배열의 각 ID가 실제로 존재하며 해당 퀴즈 세트에 속해 있는지 검증합니다.
3. 배열의 인덱스를 기반으로 새로운 `order` (1부터 시작)를 할당합니다.
4. **Prisma 트랜잭션** 내에서 다음 작업을 수행합니다:
   - 배열에 포함되지 않은 해당 세트의 기존 퀴즈들을 삭제합니다.
   - 배열에 포함된 각 퀴즈의 `order`를 업데이트합니다.

## API 사양

### 엔드포인트
`PATCH /api/quiz-sets/{id}/reorder`

### 요청 본문 (JSON)
- `quizIds`: `string[]` (필수, 최소 1개 이상의 ID 포함)

### 비즈니스 규칙
- 전달된 배열의 순서대로 `order`가 1부터 재할당됩니다.
- 배열에 없는 기존 퀴즈는 삭제됩니다.
- 퀴즈 세트가 존재하지 않거나, 다른 세트의 퀴즈 ID가 포함된 경우 에러를 반환합니다.


