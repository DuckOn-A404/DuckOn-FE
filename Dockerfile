# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
    # (Vite면 .env.production에 VITE_API_BASE_URL=/api 권장)
RUN npm run build

# --- serve ---
FROM nginx:alpine
COPY nginx.default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
