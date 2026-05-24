.PHONY: help setup start stop restart logs test load-data clean

help:
	@echo "LW-Connect AI Assistant - Available Commands"
	@echo "============================================="
	@echo "make setup       - Initial setup (copy .env, install deps)"
	@echo "make start       - Start all services"
	@echo "make stop        - Stop all services"
	@echo "make restart     - Restart all services"
	@echo "make logs        - View logs"
	@echo "make test        - Run tests"
	@echo "make load-data   - Load sample data"
	@echo "make clean       - Clean up containers and volumes"
	@echo "make shell       - Open API container shell"
	@echo "make db-shell    - Open PostgreSQL shell"
	@echo "make redis-shell - Open Redis shell"

setup:
	@echo "Setting up LW-Connect AI Assistant..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✓ Created .env file"; \
		echo "⚠️  Please edit .env and add your OPENAI_API_KEY"; \
	else \
		echo "✓ .env already exists"; \
	fi
	@pip install -r requirements.txt
	@echo "✓ Dependencies installed"

start:
	@echo "Starting services..."
	@docker-compose up -d
	@echo "✓ Services started"
	@echo "Waiting for services to be ready..."
	@sleep 10
	@curl -s http://localhost:8000/health || echo "⚠️  API not ready yet, wait a few more seconds"

stop:
	@echo "Stopping services..."
	@docker-compose down
	@echo "✓ Services stopped"

restart:
	@echo "Restarting services..."
	@docker-compose restart
	@echo "✓ Services restarted"

logs:
	@docker-compose logs -f

test:
	@echo "Running tests..."
	@python tests/test_api.py

load-data:
	@echo "Loading sample data..."
	@python scripts/load_sample_data.py

clean:
	@echo "Cleaning up..."
	@docker-compose down -v
	@echo "✓ Containers and volumes removed"

shell:
	@docker-compose exec api /bin/bash

db-shell:
	@docker-compose exec postgres psql -U lwconnect -d lwconnect

redis-shell:
	@docker-compose exec redis redis-cli

build:
	@echo "Building Docker image..."
	@docker-compose build
	@echo "✓ Build complete"

dev:
	@echo "Starting in development mode..."
	@docker-compose up

health:
	@curl -s http://localhost:8000/health | python -m json.tool

docs:
	@echo "Opening API documentation..."
	@open http://localhost:8000/docs || xdg-open http://localhost:8000/docs || echo "Visit http://localhost:8000/docs"
