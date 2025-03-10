# Используем Node.js 18 как базовый образ
FROM node:18-alpine AS base

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости
FROM base AS deps
# Проверяем наличие https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat

# Копируем файлы package.json и package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Сборка приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Устанавливаем переменные окружения для сборки
# ENV NEXT_TELEMETRY_DISABLED=1

# Собираем приложение
RUN npm run build

# Рабочий образ
FROM base AS runner
WORKDIR /app

# Устанавливаем переменные окружения для продакшена
ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1

# Создаем непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Переключаемся на непривилегированного пользователя
USER nextjs

# Открываем порт
EXPOSE 3000

# Устанавливаем переменные окружения для хоста
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Запускаем приложение
CMD ["node", "server.js"]
