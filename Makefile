.PHONY: up down logs test build lint

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

test:
	docker run --rm -v "$(CURDIR):/app" -w /app node:22-alpine sh -c "npm ci && npm test"

build:
	docker compose build

lint:
	docker run --rm -v "$(CURDIR):/app" -w /app node:22-alpine sh -c "npm ci && npm run lint"
