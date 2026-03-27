# Cubrix Backend

Backend-сервис на `NestJS` и `TypeORM` для магазина LEGO.

## Что есть в проекте

- авторизация и JWT
- пользователи и роли
- товары
- коллекции товаров
- баланс и транзакции
- Swagger-документация
- MySQL и phpMyAdmin через Docker
- миграции и сиды

## Требования

- `Node.js 22+`
- `npm`
- `Docker` и `Docker Compose` для контейнерного запуска

## Быстрый старт через Docker

Поднять все сервисы:

```bash
docker compose up --build -d
```

Доступные сервисы:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- Health: `http://localhost:3000/health`
- phpMyAdmin: `http://localhost:8080`

Доступ к phpMyAdmin:

- логин: `root`
- пароль: `root`

Остановить контейнеры:

```bash
docker compose down
```

Остановить контейнеры и удалить volume базы данных:

```bash
docker compose down -v
```

## Что происходит при старте Docker

При `docker compose up`, `docker compose up -d` или `docker compose up --build` контейнер `api` выполняет один и тот же сценарий старта:

1. запускает миграции
2. проверяет, пустая ли база данных
3. запускает сиды только если база пустая и `RUN_SEEDS=true`
4. запускает API

Важно:

- миграции выполняются при каждом старте контейнера `api`
- сиды выполняются только при первом старте пустой БД
- если сделать `docker compose down -v`, том БД удалится, и при следующем старте сиды снова выполнятся

По умолчанию в `docker-compose.yml` сиды включены:

```yaml
RUN_SEEDS: ${RUN_SEEDS:-true}
```

Если нужно отключить автозапуск сидов, задайте `RUN_SEEDS=false`.

## Локальный запуск без Docker

Установить зависимости:

```bash
npm install
```

Запустить миграции:

```bash
npm run migration:run:dev
```

Запустить сиды:

```bash
npm run seed:dev
```

Запустить приложение в development-режиме:

```bash
npm run start:dev
```

## Production-сценарий локально

```bash
npm run build
npm run migration:run
npm run seed
npm run start:prod
```

## Миграции

Запустить миграции локально:

```bash
npm run migration:run:dev
```

Откатить последнюю миграцию локально:

```bash
npm run migration:revert:dev
```

Запустить миграции внутри Docker:

```bash
docker compose exec api npm run migration:run
```

Откатить последнюю миграцию внутри Docker:

```bash
docker compose exec api npm run migration:revert
```

Сгенерировать новую миграцию:

```bash
npm run migration:generate -- src/migrations/AddSomething
```

## Сиды

Локальный запуск сидов:

```bash
npm run seed:dev
```

Запуск сидов для собранной `dist`-версии:

```bash
npm run seed
```

Сиды добавляют данные для:

- users
- collections
- products
- balances
- transactions

Тестовые пользователи:

- `admin / Admin123!`
- `builder_anna / User123!`
- `brick_max / User123!`

## Полезные npm-скрипты

- `npm run build` - сборка проекта
- `npm run start` - обычный запуск
- `npm run start:dev` - запуск в watch-режиме
- `npm run start:prod` - запуск production-сборки
- `npm run test` - unit-тесты
- `npm run test:e2e` - e2e-тесты
- `npm run test:cov` - тесты с coverage
- `npm run lint` - eslint

## Переменные окружения

Основные переменные из [`.env.example`](./.env.example):

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `DB_LOGGING`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `NODE_ENV`
- `RUN_SEEDS`

## Структура сервисов Docker

- `mysql` - база данных MySQL 8.4
- `api` - NestJS backend
- `phpmyadmin` - интерфейс для работы с БД

## Только API без docker-compose

Собрать образ:

```bash
docker build -t cubrix-api .
```

Запустить контейнер:

```bash
docker run --rm -p 3000:3000 --env-file .env cubrix-api
```
