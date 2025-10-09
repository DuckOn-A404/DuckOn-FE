# 1) Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# 2) Runtime
FROM nginx:alpine
WORKDIR /

ARG NGINX_CONF=nginx.dev.conf
COPY nginx.dev.conf /tmp/nginx.dev.conf
COPY nginx.prod.conf /tmp/nginx.prod.conf

RUN cp "/tmp/${NGINX_CONF}" /etc/nginx/conf.d/default.conf && \
    echo "Using Nginx conf: ${NGINX_CONF}" && \
    if [ "${NGINX_CONF}" = "nginx.prod.conf" ]; then \
      ! grep -q 'duckon-app-dev' /etc/nginx/conf.d/default.conf; \
    fi

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx","-g","daemon off;"]
