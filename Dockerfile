# ---- Этап 1: Сборка Frontend (Next.js) ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY bzik_frontend/package*.json ./
RUN npm ci
COPY bzik_frontend/ .
ENV NEXT_PUBLIC_API_URL=/api
RUN npm run build

# ---- Этап 2: Финальный образ ----
FROM ubuntu:22.04

# Отключаем интерактивные запросы при установке пакетов
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Устанавливаем Python 3.11, Nginx, Supervisor, Node.js 20
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    software-properties-common \
    tzdata \
    && ln -fs /usr/share/zoneinfo/UTC /etc/localtime \
    && dpkg-reconfigure --frontend noninteractive tzdata \
    && add-apt-repository ppa:deadsnakes/ppa -y \
    && apt-get update \
    && apt-get install -y python3.11 python3.11-venv python3.11-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && ln -sf /usr/bin/python3.11 /usr/bin/python \
    && ln -sf /usr/bin/python3.11 /usr/bin/python3 \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем pip для Python 3.11
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.11

# Копируем requirements и устанавливаем зависимости Python
COPY bzik_backend/requirements.txt /app/backend/requirements.txt
WORKDIR /app/backend
RUN pip3.11 install --no-cache-dir -r requirements.txt

# Копируем весь бекенд
COPY bzik_backend/ /app/backend/

# Копируем собранный фронтенд
COPY --from=frontend-builder /app/frontend /app/frontend

# Копируем конфиги Nginx и Supervisor
COPY nginx/nginx.conf /etc/nginx/sites-available/default
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Копируем entrypoint и делаем исполняемым
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 7860
CMD ["/entrypoint.sh"]
