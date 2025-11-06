.PHONY: help build up down restart logs clean

help: ## Mostrar ayuda
    @grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Construir contenedores
    docker-compose build

up: ## Iniciar servicios
    docker-compose up -d

down: ## Detener servicios
    docker-compose down

restart: ## Reiniciar servicios
    docker-compose restart

logs: ## Ver logs
    docker-compose logs -f

logs-backend: ## Ver logs del backend
    docker-compose logs -f backend

logs-frontend: ## Ver logs del frontend
    docker-compose logs -f frontend

logs-db: ## Ver logs de MongoDB
    docker-compose logs -f mongodb

clean: ## Limpiar contenedores y volúmenes
    docker-compose down -v
    docker system prune -f

ps: ## Ver estado de servicios
    docker-compose ps

shell-backend: ## Acceder a shell del backend
    docker-compose exec backend sh

shell-frontend: ## Acceder a shell del frontend
    docker-compose exec frontend sh

shell-db: ## Acceder a MongoDB shell
    docker-compose exec mongodb mongosh -u admin -p ${MONGO_ROOT_PASSWORD}

backup-db: ## Backup de MongoDB
    docker-compose exec -T mongodb mongodump --uri="mongodb://admin:${MONGO_ROOT_PASSWORD}@localhost:27017/muebles_db?authSource=admin" --archive > backup_$(shell date +%Y%m%d_%H%M%S).dump

restore-db: ## Restaurar MongoDB (usar: make restore-db FILE=backup.dump)
    docker-compose exec -T mongodb mongorestore --uri="mongodb://admin:${MONGO_ROOT_PASSWORD}@localhost:27017/muebles_db?authSource=admin" --archive < $(FILE)