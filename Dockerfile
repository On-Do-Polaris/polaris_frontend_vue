# 빌드 스테이지
FROM node:22-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 빌드 인자 정의 (GitHub Actions에서 전달받음)
ARG VITE_API_BASE_URL
ARG VITE_VWORLD_API

# 환경 변수로 설정 (Vite 빌드 시 사용됨)
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_VWORLD_API=$VITE_VWORLD_API

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (프로덕션 + 개발 의존성 모두 설치)
RUN npm ci

# 소스 코드 전체 복사
COPY . .

# TypeScript 타입 체크 및 프로덕션 빌드
RUN npm run build

# 프로덕션 스테이지
FROM nginx:stable-alpine

# 빌드된 정적 파일을 nginx html 디렉토리로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx 설정 파일 복사 (SPA 라우팅 지원)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 불필요한 기본 설정 제거
RUN rm -f /etc/nginx/conf.d/default.conf.bak

# nginx 사용자 권한 설정
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 80 포트 노출
EXPOSE 80

# Health check 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]
