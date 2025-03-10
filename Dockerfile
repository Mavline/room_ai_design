# Используем Node.js 18 как базовый образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Проверяем наличие https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat

# Копируем файлы package.json и package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Копируем остальные файлы проекта
COPY . .

# Устанавливаем переменные окружения для продакшена
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Собираем приложение
RUN npm run build

# Открываем порт
EXPOSE 3000

# Добавляем healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Запускаем приложение
# Используем npm run dev вместо node server.js, так как это работает в GitHub-деплое
CMD ["npm", "run", "dev"]
