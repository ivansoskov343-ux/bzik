# ---- Этап 1: Сборка Frontend (Next.js) ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY bzik_frontend/package*.json ./
RUN npm ci
COPY bzik_frontend/ .
ENV NEXT_PUBLIC_API_URL=/api
RUN npm run build

# ---- Этап 2: Сборка Backend (Django) ----
FROM python:3.11-slim AS backend-builder
WORKDIR /app/backend
COPY bzik_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY bzik_backend/ .

# ---- Этап 3: Финальный образ ----
FROM ubuntu:22.04

# Устанавливаем Nginx, Supervisor, Python, Node.js 20, curl и другие необходимые пакеты
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    python3 \
    python3-pip \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Копируем зависимости Python (из этапа 2)
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /app/backend /app/backend

# Копируем собранный фронтенд (из этапа 1)
COPY --from=frontend-builder /app/frontend /app/frontend

# Копируем конфиги Nginx и Supervisor
COPY nginx/nginx.conf /etc/nginx/sites-available/default
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Копируем и настраиваем entrypoint.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Hugging Face требует порт 7860
EXPOSE 7860

# Запускаем entrypoint.sh (он выполнит миграции, статику и затем supervisor)
CMD ["/entrypoint.sh"]
