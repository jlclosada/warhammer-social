#!/bin/bash
# ═══════════════════════════════════════════
# Create databases for all environments
# Run this ONCE after starting the Docker container
# ═══════════════════════════════════════════
set -e

CONTAINER="wh_portal_db"
PG_USER="postgres"

echo "╔══════════════════════════════════════════╗"
echo "║  Creating Warhammer Portal databases     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check if Docker container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    echo "❌ Container '${CONTAINER}' is not running."
    echo "   Run: docker compose up -d"
    exit 1
fi

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until docker exec $CONTAINER pg_isready -U $PG_USER > /dev/null 2>&1; do
    sleep 1
done
echo "✅ PostgreSQL is ready"
echo ""

# Create databases
for DB_NAME in warhammer_portal warhammer_portal_qa warhammer_portal_prod; do
    EXISTS=$(docker exec $CONTAINER psql -U $PG_USER -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null)
    if [ "$EXISTS" = "1" ]; then
        echo "⚡ Database '${DB_NAME}' already exists — skipping"
    else
        docker exec $CONTAINER psql -U $PG_USER -c "CREATE DATABASE ${DB_NAME};" > /dev/null 2>&1
        echo "✅ Created database: ${DB_NAME}"
    fi
done

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Databases ready!                        ║"
echo "╠══════════════════════════════════════════╣"
echo "║  DEV:   warhammer_portal                 ║"
echo "║  QA:    warhammer_portal_qa              ║"
echo "║  PROD:  warhammer_portal_prod            ║"
echo "╠══════════════════════════════════════════╣"
echo "║                                          ║"
echo "║  Apply migrations:                       ║"
echo "║  DEV:   python manage.py migrate         ║"
echo "║  QA:    ENV_FILE=.env.qa python manage.py migrate  ║"
echo "║  PROD:  ENV_FILE=.env.prod python manage.py migrate║"
echo "╚══════════════════════════════════════════╝"

