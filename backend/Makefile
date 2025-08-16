.PHONY: help install install-dev lint format type-check test clean run

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install production dependencies
	python3 -m pip install --break-system-packages -r requirements.txt

install-dev: ## Install development dependencies
	python3 -m pip install --break-system-packages -r requirements.txt
	python3 -m pip install --break-system-packages -r requirements-dev.txt

lint: ## Run all linting tools
	flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	flake8 . --count --exit-zero --max-complexity=10 --max-line-length=100 --statistics
	mypy .
	isort --check-only .

format: ## Format code with black and isort
	black .
	isort .

format-check: ## Check code formatting without making changes
	black --check .
	isort --check-only .

type-check: ## Run type checking with mypy
	mypy .

test: ## Run tests
	python3 -m pytest tests/ -v

clean: ## Clean up cache and temporary files
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +

run: ## Run the FastAPI server
	export PATH=$$PATH:/home/ubuntu/.local/bin && python3 main.py

dev: ## Run the FastAPI server in development mode
	export PATH=$$PATH:/home/ubuntu/.local/bin && uvicorn main:app --host 0.0.0.0 --port 8000 --reload