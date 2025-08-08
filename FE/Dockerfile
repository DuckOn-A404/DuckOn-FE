# 1) Builder 단계: Vite 앱을 빌드
FROM node:18-alpine AS builder
WORKDIR /app

# ② 의존성 설치
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ③ 소스 복사 및 빌드
COPY . .
RUN npm run build

# 2) Runtime 단계: Nginx로 정적파일 서빙 + /api 프록시
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
