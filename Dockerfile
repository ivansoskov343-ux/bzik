# ---- Этап 1: Сборка Frontend (Next.js) ----
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY bzik_frontend/package*.json ./
RUN npm ci
COPY bzik_frontend/ .
# Указываем API_URL для production окружения
ENV NEXT_PUBLIC_API_URL=/api
RUN npm run build
# ---- Этап 2: Сборка Backend (FastAPI) ----
FROM python:3.11-slim AS backend-builder
WORKDIR /app/backend
COPY bzik_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY bzik_backend/ .
# ---- Этап 3: Финальный образ ----
FROM ubuntu:22.04

# Устанавливаем Supervisor, Nginx, Node.js (для Next.js), Python и другие необходимые пакеты
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Копируем и устанавливаем зависимости Python из предыдущего этапа
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /app/backend /app/backend
# Копируем собранный фронтенд
COPY --from=frontend-builder /app/frontend /app/frontend

# Копируем и настраиваем Nginx
COPY nginx/nginx.conf /etc/nginx/sites-available/default
# Копируем конфигурацию Supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Открываем порт, который ожидает Hugging Face (по умолчанию 7860)
EXPOSE 7860

# Запускаем Supervisor, который будет управлять Nginx и вашими приложениями
CMD ["/usr/bin/supervisord", "-n"]
