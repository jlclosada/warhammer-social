#!/bin/bash
set -e

echo "============================================"
echo "  Warhammer Portal - Development Setup"
echo "============================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ──────────────────────────────────────────────
# 1. PostgreSQL via Docker
# ──────────────────────────────────────────────
echo "[1/5] Starting PostgreSQL with Docker..."
cd "$SCRIPT_DIR"
if command -v docker &> /dev/null; then
    docker-compose down -v 2>/dev/null || true
    docker-compose up -d
    echo "  PostgreSQL running on port 5434 (mapped to container 5432)"
    echo "  Waiting for PostgreSQL to be ready..."
    sleep 3
    until docker exec wh_portal_db pg_isready -U postgres > /dev/null 2>&1; do
      sleep 1
    done
    echo "  PostgreSQL is ready!"
else
    echo "  WARNING: Docker not found. Please install Docker or start PostgreSQL manually."
    echo "  Database config: name=warhammer_portal, user=postgres, password=postgres, host=localhost, port=5434"
fi
echo ""

# ──────────────────────────────────────────────
# 2. Backend virtual environment
# ──────────────────────────────────────────────
echo "[2/5] Setting up Python backend..."
cd "$SCRIPT_DIR/backend"

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "  Virtual environment created"
fi

source venv/bin/activate
pip install --upgrade pip > /dev/null
pip install -r requirements.txt
echo "  Dependencies installed"
echo ""

# ──────────────────────────────────────────────
# 3. Django migrations
# ──────────────────────────────────────────────
echo "[3/5] Running Django migrations..."
python manage.py makemigrations users collections
python manage.py migrate
echo "  Migrations applied"
echo ""

# ──────────────────────────────────────────────
# 4. Seed data
# ──────────────────────────────────────────────
echo "[4/5] Seeding game systems and achievements..."
python manage.py seed_game_systems
python manage.py seed_achievements
echo ""

# ──────────────────────────────────────────────
# 5. Frontend
# ──────────────────────────────────────────────
echo "[5/5] Setting up React frontend..."
cd "$SCRIPT_DIR/frontend"
npm install
echo "  Frontend dependencies installed"
echo ""

# ──────────────────────────────────────────────
# Done
# ──────────────────────────────────────────────
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "  Create a Django superuser (admin):"
echo "    cd backend && source venv/bin/activate"
echo "    python manage.py createsuperuser"
echo ""
echo "  Start the backend:"
echo "    cd backend && source venv/bin/activate"
echo "    python manage.py runserver"
echo ""
echo "  Start the frontend (new terminal):"
echo "    cd frontend && npm run dev"
echo ""
echo "  URLs:"
echo "    Frontend:  http://localhost:5173"
echo "    Backend:   http://localhost:8000"
echo "    Swagger:   http://localhost:8000/swagger/"
echo "    Admin:     http://localhost:8000/admin/"
echo "============================================"

