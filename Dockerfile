# ==========================
# 1) Build Stage (Vite build)
# ==========================
FROM node:20-alpine AS builder
WORKDIR /app

# 패키지 설치
COPY package*.json ./
RUN npm ci

# --- Vite 환경변수 (빌드타임 인자)
ARG VITE_API_BASE_URL=/api
ARG VITE_OAUTH2_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_OAUTH2_BASE_URL=$VITE_OAUTH2_BASE_URL

# 앱 코드 복사 후 빌드
COPY . .
RUN npm run build


# ==========================
# 2) Runtime Stage (Nginx serve)
# ==========================
FROM nginx:alpine
WORKDIR /

# --- Nginx conf 선택 빌드
ARG NGINX_CONF=nginx.dev.conf
COPY nginx.dev.conf /tmp/nginx.dev.conf
COPY nginx.prod.conf /tmp/nginx.prod.conf

# --- 선택된 conf를 default.conf로 복사
RUN cp "/tmp/${NGINX_CONF}" /etc/nginx/conf.d/default.conf && \
    echo "✅ Using Nginx conf: ${NGINX_CONF}" && \
    if [ "${NGINX_CONF}" = "nginx.prod.conf" ]; then \
      echo "✔ Verified: Production conf active"; \
    else \
      echo "✔ Verified: Development conf active"; \
    fi

# --- 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx","-g","daemon off;"]
