# Multi-Vendor Marketplace Makefile

.PHONY: help build up down restart logs migrate seed test lint clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make build      - Build all Docker images"
	@echo "  make up         - Start all services"
	@echo "  make down       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - View logs from all services"
	@echo "  make migrate    - Run database migrations"
	@echo "  make seed       - Seed database with sample data"
	@echo "  make test       - Run all tests"
	@echo "  make lint       - Run linting"
	@echo "  make clean      - Clean up Docker volumes and images"
	@echo "  make dev        - Start development environment"
	@echo "  make prod       - Start production environment"

# Build
build:
	docker-compose build

build-no-cache:
	docker-compose build --no-cache

# Start/Stop
up:
	docker-compose up -d

down:
	docker-compose down

down-volumes:
	docker-compose down -v

restart: down up

# Logs
logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-frontend:
	docker-compose logs -f frontend

# Database
migrate:
	docker-compose exec api alembic upgrade head

migrate-create:
	@echo "Enter migration message: "; \
	read message; \
	docker-compose exec api alembic revision --autogenerate -m "$$message"

migrate-rollback:
	docker-compose exec api alembic downgrade -1

seed:
	docker-compose exec api python scripts/seed.py

db-reset:
	docker-compose exec api alembic downgrade base
	docker-compose exec api alembic upgrade head

# Testing
test:
	docker-compose exec api pytest

test-cov:
	docker-compose exec api pytest --cov=app tests/

test-frontend:
	docker-compose exec frontend ng test --watch=false

# Linting
lint:
	docker-compose exec api flake8 app/
	docker-compose exec frontend ng lint

format:
	docker-compose exec api black app/
	docker-compose exec api isort app/

# Shell access
shell:
	docker-compose exec api /bin/bash

shell-db:
	docker-compose exec postgres psql -U postgres -d marketplace

# Production
prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-up:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Development
dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && ng serve

# Clean up
clean:
	docker-compose down -v
	docker system prune -f
	docker volume prune -f

clean-all:
	docker-compose down -v --rmi all
	docker system prune -af
	docker volume prune -f

# Backup and Restore
backup-db:
	@mkdir -p backups
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	docker-compose exec postgres pg_dump -U postgres marketplace > backups/backup_$$timestamp.sql
	@echo "Database backed up to backups/backup_$$timestamp.sql"

restore-db:
	@echo "Available backups:"
	@ls -1 backups/
	@echo "Enter backup file name: "; \
	read filename; \
	docker-compose exec -T postgres psql -U postgres marketplace < backups/$$filename

# Monitoring
stats:
	docker stats

ps:
	docker-compose ps

# Update
update:
	git pull
	docker-compose build
	docker-compose up -d
