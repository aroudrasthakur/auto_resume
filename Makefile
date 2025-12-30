.PHONY: help dev test lint typecheck migrate seed clean install

help:
	@echo "Available commands:"
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Start all services in development mode"
	@echo "  make test       - Run all tests"
	@echo "  make lint       - Run linters"
	@echo "  make typecheck  - Run type checkers"
	@echo "  make migrate    - Run database migrations"
	@echo "  make seed       - Seed database"
	@echo "  make redis      - Start Redis container"
	@echo "  make clean      - Clean build artifacts"

install:
	cd backend && poetry install
	cd worker && poetry install
	cd shared && poetry install
	cd frontend && pnpm install

dev:
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "API Docs: http://localhost:8000/docs"
	docker compose up -d redis
	cd backend && poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
	cd worker && poetry run celery -A app.celery_app worker --loglevel=info &
	cd frontend && pnpm dev

test:
	cd backend && poetry run pytest --cov=app --cov-report=xml --cov-report=html
	cd worker && poetry run pytest --cov=app --cov-report=xml --cov-report=html
	cd frontend && pnpm test --coverage

lint:
	cd backend && poetry run black --check . && poetry run isort --check . && poetry run mypy app
	cd worker && poetry run black --check . && poetry run isort --check . && poetry run mypy app
	cd frontend && pnpm lint

typecheck:
	cd backend && poetry run mypy app
	cd worker && poetry run mypy app
	cd frontend && pnpm type-check

migrate:
	cd migrations && poetry run alembic upgrade head

seed:
	cd migrations && poetry run python seed.py

redis:
	docker compose up -d redis

clean:
	find . -type d -name __pycache__ -exec rm -r {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name "*.egg-info" -exec rm -r {} +
	find . -type d -name ".pytest_cache" -exec rm -r {} +
	find . -type d -name "htmlcov" -exec rm -r {} +
	rm -rf frontend/.next frontend/out frontend/dist
	rm -rf backend/dist worker/dist shared/dist

