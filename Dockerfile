# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite 기준: API는 리버스프록시(/api) 쓰므로 아래처럼 맞춰두는 걸 추천
# (레포에 .env.production 파일도 같이 두면 더 편함)
RUN npm run build    # dist/ 생성

# --- serve stage ---
FROM nginx:alpine
# SPA 라우팅을 위한 Nginx 설정(아래 default.conf를 덮어씀)
COPY nginx.default.conf /etc/nginx/conf.d/default.conf
# 빌드 산출물 복사
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
