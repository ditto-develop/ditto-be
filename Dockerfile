# [Stage 1] 빌드용 이미지 (Builder)
FROM node:22-alpine AS builder

# pnpm 설치 및 활성화
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 1. 의존성 설치를 위해 설정 파일만 복사 (캐시 활용)
COPY package.json pnpm-lock.yaml ./

# 2. 의존성 설치 (Frozen lockfile로 버전 고정)
RUN pnpm install --frozen-lockfile

# 3. 소스 코드 및 Prisma 스키마 복사
COPY . .

# 4. Prisma Client 생성 (Alpine용 엔진이 여기서 생성됨!)
RUN npx prisma generate

# 5. NestJS 빌드 (dist 폴더 생성)
RUN pnpm build

# ---------------------------------------------------

# [Stage 2] 실행용 이미지 (Runner) - 가볍게 만듦
FROM node:22-alpine AS runner

WORKDIR /app

# 프로덕션 환경 변수 설정
ENV NODE_ENV production

# Builder 단계에서 만든 결과물만 쏙 빼오기
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 실행
CMD ["node", "dist/main.js"]