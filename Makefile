.PHONY: setup install db-up db-down migrate dev

BACKEND_DIR = back-end
DOCKER_COMPOSE_BACKEND = $(BACKEND_DIR)/docker/docker-compose.dev.yml

# Instala as dependências do back-end
install:
	cd $(BACKEND_DIR) && pnpm install

# Inicia o banco de dados via Docker Compose
db-up:
	docker-compose -f $(DOCKER_COMPOSE_BACKEND) up -d

# Para o banco de dados
db-down:
	docker-compose -f $(DOCKER_COMPOSE_BACKEND) down

# Roda as migrations do banco de dados (Drizzle)
migrate:
	cd $(BACKEND_DIR) && pnpm run db:migrate

# Executa todo o fluxo de setup inicial (instalação, db e migrations)
setup: install db-up
	@echo "Aguardando o banco de dados estar pronto para as migrations..."
	@sleep 3
	$(MAKE) migrate

# Inicia o servidor de desenvolvimento
dev:
	make db-up
	cd $(BACKEND_DIR) && pnpm run dev

stop:
	make db-down