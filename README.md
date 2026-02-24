<p align="center">
  <img src="https://img.shields.io/badge/Django-5.1-092E20?style=for-the-badge&logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

# ⚔️ Warhammer Portal

A social platform for Warhammer hobbyists to manage their miniature collections, share their painted work, and connect with the community — built with a modern stack inspired by Instagram's UX and Apple's design language.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start (Development)](#-quick-start-development)
  - [Automated Setup](#option-a-automated-setup-recommended)
  - [Manual Setup](#option-b-manual-setup)
- [Database Setup](#-database-setup)
  - [Local Development (Docker)](#local-development-docker)
  - [Local Development (Native PostgreSQL)](#local-development-native-postgresql)
  - [QA / Staging Database](#qa--staging-database)
  - [Production Database](#production-database)
- [Environment Configuration](#-environment-configuration)
  - [Backend Environments](#backend-env)
  - [Frontend Environments](#frontend-env)
  - [Environment Differences](#environment-comparison)
- [Running the Application](#-running-the-application)
  - [Development](#development)
  - [QA / Staging](#qa--staging)
  - [Production Build](#production-build)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Data Model](#-data-model)
- [Seed Data](#-seed-data)
- [Testing](#-testing)
- [Deployment](#-deployment)
  - [Docker Compose (Full Stack)](#docker-compose-full-stack)
  - [Manual Deployment](#manual-deployment)
  - [Cloud Deployment Notes](#cloud-deployment-notes)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Features

### Collection Management
- **Multi-game system support** — Warhammer 40K, Age of Sigmar, Horus Heresy, Kill Team, and more
- **Faction-based collections** — Organized by Grand Alliance (Chaos, Imperium, Xenos, Order, Destruction, Death)
- **Miniature catalog** — Admin-managed catalog with tags, images, and points costs
- **Quantity tracking** — Track 10 Tzaangors as 10 miniatures, not 1 entry
- **Paint status tracking** — Unassembled → Assembled → Primed → WIP → Based → Painted → Display Ready
- **Paint progress** — Automatic collection completion percentage

### Social Network
- **Public feed** — "For You" and "Following" tabs (Instagram-style)
- **Publishing** — Share painted miniatures publicly with images
- **Likes & Saves** — Like/bookmark miniatures with optimistic updates
- **Comments** — Comment on posts with threaded comment likes
- **Follow system** — Public profiles, follow/unfollow with no friend requests
- **User search** — Full-screen modal search by username or name
- **User profiles** — Avatar, bio, post/collection/achievement tabs

### Notifications & Achievements
- **Real-time notifications** — Likes, comments, follows, achievement unlocks
- **Unread badge** — Persistent badge count in sidebar/mobile nav
- **35 achievements** across 4 categories:
  - 🎨 **Painting** — First brushstroke to legendary painter
  - 📦 **Collecting** — Army builder milestones
  - 💬 **Social** — Community engagement
  - 🧭 **Explorer** — Multi-faction, multi-game diversity

### User Experience
- **Apple/Notion-inspired design** — Minimalist, clean, glassmorphism cards
- **Framer Motion animations** — Smooth transitions, optimistic updates, spring physics
- **Responsive** — Desktop sidebar + mobile bottom nav
- **Environment banner** — DEV (green) / QA (amber) banners, hidden in PROD
- **Profile editing** — Avatar upload, bio, personal info

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend Framework** | Django + Django REST Framework | 5.1 + 3.15 |
| **Authentication** | SimpleJWT (token rotation + blacklisting) | 5.4 |
| **Database** | PostgreSQL | 16 |
| **Frontend Framework** | React | 19 |
| **Styling** | Tailwind CSS | 4.0 |
| **Animations** | Framer Motion | 11 |
| **State Management** | Zustand | 5 |
| **HTTP Client** | Axios | 1.7 |
| **Icons** | Lucide React | 0.469 |
| **Build Tool** | Vite | 6 |
| **3D Gallery** | OGL (WebGL) | 1.0 |
| **API Docs** | Swagger / ReDoc (drf-yasg) | 1.21 |
| **Container** | Docker + Docker Compose | — |

---

## 🏗 Architecture

```
┌──────────────────────────┐      ┌──────────────────────────┐
│     Frontend (React)     │      │   Backend (Django DRF)   │
│                          │      │                          │
│  Vite Dev Server :5173   │─────▶│  Django :8000            │
│  or Nginx (prod)         │ API  │  /api/v1/auth/...        │
│                          │      │  /api/v1/collections/... │
│  Zustand (state)         │      │                          │
│  Axios (HTTP)            │      │  JWT Authentication      │
│  Framer Motion (UI)      │      │  PostgreSQL              │
└──────────────────────────┘      └──────────┬───────────────┘
                                             │
                                  ┌──────────▼───────────────┐
                                  │   PostgreSQL :5434       │
                                  │   (Docker or native)     │
                                  └──────────────────────────┘
```

---

## 📋 Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| **Python** | 3.11+ | `python3 --version` |
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Docker** | 20+ (optional) | `docker --version` |
| **Docker Compose** | 2+ (optional) | `docker compose version` |
| **Git** | 2.30+ | `git --version` |

> **Note:** Docker is optional. You can install PostgreSQL natively instead. See [Database Setup](#-database-setup).

---

## 🚀 Quick Start (Development)

### Option A: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/warhammer-portal.git
cd warhammer-portal

# Run the setup script (starts Docker DB + installs everything)
chmod +x setup.sh
./setup.sh

# Create a superuser (admin account)
cd backend && source venv/bin/activate
python manage.py createsuperuser

# Seed achievements
python manage.py seed_achievements
```

Then start the servers in two terminals:

```bash
# Terminal 1 — Backend
cd backend && source venv/bin/activate
python manage.py runserver

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173** and start using the app.

### Option B: Manual Setup

#### 1. Start PostgreSQL

```bash
# Using Docker (recommended)
docker compose up -d

# This creates:
#   - Database: warhammer_portal
#   - User: postgres
#   - Password: postgres
#   - Port: 5434 (host) → 5432 (container)
```

#### 2. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate   # macOS/Linux
# .\venv\Scripts\activate  # Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file (copy from example or create manually)
cp .env.example .env
# Edit .env if needed (database credentials, secret key, etc.)

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Seed reference data
python manage.py seed_game_systems
python manage.py seed_achievements

# Start development server
python manage.py runserver
```

#### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 4. Verify

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Frontend application |
| http://localhost:8000 | Backend API |
| http://localhost:8000/admin/ | Django admin panel |
| http://localhost:8000/swagger/ | Swagger API docs |
| http://localhost:8000/redoc/ | ReDoc API docs |

---

## 🗄 Database Setup

### Local Development (Docker)

The simplest way — no PostgreSQL installation required:

```bash
# From the project root
docker compose up -d
```

This starts PostgreSQL 16 in a Docker container:

| Parameter | Value |
|-----------|-------|
| Host | `localhost` |
| Port | `5434` |
| Database | `warhammer_portal` |
| User | `postgres` |
| Password | `postgres` |

**Useful Docker commands:**

```bash
# Check container status
docker compose ps

# View database logs
docker compose logs db

# Stop the database
docker compose down

# Stop and DELETE all data (fresh start)
docker compose down -v

# Connect to PostgreSQL shell
docker exec -it wh_portal_db psql -U postgres -d warhammer_portal
```

### Local Development (Native PostgreSQL)

If you prefer to install PostgreSQL natively (Homebrew on macOS):

```bash
# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Create the database and user
psql postgres <<EOF
CREATE USER wh_portal_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE warhammer_portal OWNER wh_portal_user;
ALTER USER wh_portal_user CREATEDB;  -- Needed for running tests
GRANT ALL PRIVILEGES ON DATABASE warhammer_portal TO wh_portal_user;
EOF
```

Update `backend/.env`:

```dotenv
DB_NAME=warhammer_portal
DB_USER=wh_portal_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
```

Then run migrations:

```bash
cd backend && source venv/bin/activate
python manage.py migrate
python manage.py seed_game_systems
python manage.py seed_achievements
```

### QA / Staging Database

Create a **separate** database for QA to prevent cross-contamination with development data:

```bash
# Option 1: Docker (separate container)
docker run -d \
  --name wh_portal_qa_db \
  -e POSTGRES_DB=warhammer_portal_qa \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=qa_secure_password \
  -p 5435:5432 \
  -v wh_portal_qa_data:/var/lib/postgresql/data \
  postgres:16-alpine

# Option 2: Managed service (AWS RDS, Supabase, Neon, etc.)
# Use the connection string provided by the service
```

QA `backend/.env`:

```dotenv
ENVIRONMENT=qa
DEBUG=False
SECRET_KEY=your-qa-secret-key-change-this

DB_NAME=warhammer_portal_qa
DB_USER=postgres
DB_PASSWORD=qa_secure_password
DB_HOST=localhost       # or your managed DB host
DB_PORT=5435            # or 5432 for managed

ALLOWED_HOSTS=qa.warhammer-portal.com,localhost
CORS_ALLOWED_ORIGINS=https://qa.warhammer-portal.com
```

### Production Database

> ⚠️ **Never use default credentials in production.** Generate strong, unique passwords.

**Recommended: Managed PostgreSQL** (AWS RDS, Google Cloud SQL, Supabase, Neon, DigitalOcean):

```bash
# Example: Create on Supabase / Neon / Railway
# You'll get a connection string like:
# postgresql://user:password@host:5432/warhammer_portal_prod
```

**Self-hosted production database:**

```bash
# On your production server
sudo -u postgres psql <<EOF
-- Create dedicated user with strong password
CREATE USER wh_prod_user WITH PASSWORD '$(openssl rand -base64 32)';

-- Create production database
CREATE DATABASE warhammer_portal_prod
  OWNER wh_prod_user
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;

-- Restrict permissions
REVOKE ALL ON DATABASE warhammer_portal_prod FROM PUBLIC;
GRANT CONNECT ON DATABASE warhammer_portal_prod TO wh_prod_user;
EOF
```

**Production security checklist:**

- [ ] Use a strong, unique `SECRET_KEY` (generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
- [ ] Set `DEBUG=False`
- [ ] Enable SSL connections to the database (`sslmode=require`)
- [ ] Set up automated backups (daily minimum)
- [ ] Use a firewall — only allow your app server's IP to connect to the DB
- [ ] Monitor disk space and query performance
- [ ] Separate read replicas for heavy reads (optional)

Production `backend/.env`:

```dotenv
ENVIRONMENT=prod
DEBUG=False
SECRET_KEY=your-production-secret-key-50-chars-minimum-random

DB_NAME=warhammer_portal_prod
DB_USER=wh_prod_user
DB_PASSWORD=your-ultra-strong-generated-password
DB_HOST=your-db-host.region.rds.amazonaws.com
DB_PORT=5432

ALLOWED_HOSTS=warhammer-portal.com,www.warhammer-portal.com
CORS_ALLOWED_ORIGINS=https://warhammer-portal.com,https://www.warhammer-portal.com

SECURE_SSL_REDIRECT=True
```

---

## ⚙️ Environment Configuration

The application supports three environments: **DEV**, **QA**, and **PROD**. Each environment adjusts security, logging, throttling, and UI behavior.

### Backend (.env) {#backend-env}

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

**All available variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | — (required) | Django secret key |
| `ENVIRONMENT` | `dev` | `dev` \| `qa` \| `prod` |
| `DEBUG` | `True` if dev | Enable debug mode |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated hostnames |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated origins |
| `DB_NAME` | `warhammer_portal` | PostgreSQL database name |
| `DB_USER` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `SECURE_SSL_REDIRECT` | `True` (prod only) | Force HTTPS redirect |

### Frontend (.env) {#frontend-env}

| File | Used for | `VITE_APP_ENV` |
|------|----------|----------------|
| `.env` / `.env.development` | `npm run dev` | `dev` |
| `.env.qa` | `npm run build:qa` | `qa` |
| `.env.production` | `npm run build:prod` | `prod` |

**Frontend variables:**

| Variable | Description |
|----------|-------------|
| `VITE_APP_ENV` | `dev` \| `qa` \| `prod` — controls environment banner |
| `VITE_API_URL` | Backend API base URL (e.g., `/api/v1` or `https://api.domain.com/api/v1`) |
| `VITE_APP_VERSION` | Displayed in the environment banner |

### Environment Comparison {#environment-comparison}

| Feature | DEV | QA | PROD |
|---------|-----|-----|------|
| `DEBUG` | ✅ True | ❌ False | ❌ False |
| Environment banner | 🟢 Green | 🟡 Amber | Hidden |
| Throttle (anon / user) | 200 / 500 min | 60 / 200 min | 30 / 100 min |
| JWT access token lifetime | 2 hours | 30 minutes | 15 minutes |
| JWT refresh token lifetime | 30 days | 7 days | 3 days |
| Email verification | None | None | Mandatory |
| Log level | DEBUG | INFO | WARNING |
| SSL / HSTS / Security headers | ❌ | ❌ | ✅ |
| Swagger UI | ✅ | ✅ | ✅ (restrict in nginx) |

---

## 🏃 Running the Application

### Development

```bash
# Terminal 1 — Database (if using Docker)
docker compose up -d

# Terminal 2 — Backend
cd backend
source venv/bin/activate
python manage.py runserver
# → http://localhost:8000

# Terminal 3 — Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

### QA / Staging

```bash
# Backend
cd backend
ENVIRONMENT=qa python manage.py runserver 0.0.0.0:8000

# Frontend
cd frontend
npm run build:qa
npm run preview
# Or serve with nginx
```

### Production Build

```bash
# Backend — served with gunicorn
cd backend
pip install gunicorn
ENVIRONMENT=prod gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --timeout 120

# Frontend — build static files
cd frontend
npm run build:prod
# Output: frontend/dist/
# Serve with nginx, Netlify, Vercel, etc.
```

---

## 📡 API Reference

Base URL: `/api/v1`

### Authentication (`/auth/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register/` | ❌ | Create new account |
| `POST` | `/auth/register/check-email/` | ❌ | Check email availability |
| `POST` | `/auth/login/` | ❌ | Login → JWT tokens + user |
| `POST` | `/auth/login/refresh/` | ❌ | Refresh access token |
| `POST` | `/auth/logout/` | ✅ | Blacklist refresh token |
| `GET` | `/auth/me/` | ✅ | Get current user |
| `PATCH` | `/auth/me/` | ✅ | Update profile (supports multipart for avatar) |
| `POST` | `/auth/me/change-password/` | ✅ | Change password |
| `GET` | `/auth/users/search/?q=` | ✅ | Search users by name/username |
| `GET` | `/auth/env/` | ❌ | Get current environment info |

### Collections (`/collections/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/collections/game-systems/` | ✅ | List all game systems |
| `GET` | `/collections/factions/` | ✅ | List factions (filter: `?game_system=<id>`) |
| `GET` | `/collections/tags/` | ✅ | List tags |
| `POST` | `/collections/tags/` | ✅ Admin | Create tag |
| `GET` | `/collections/catalog/` | ✅ | List catalog miniatures |
| `POST` | `/collections/catalog/` | ✅ Admin | Create catalog miniature |
| `GET` | `/collections/catalog/search/?q=` | ✅ | Search catalog |
| `GET/PATCH/DELETE` | `/collections/catalog/<id>/` | ✅ | Catalog miniature detail |
| `GET` | `/collections/` | ✅ | List my collections |
| `POST` | `/collections/` | ✅ | Create collection |
| `GET/PATCH/DELETE` | `/collections/<id>/` | ✅ | Collection detail |
| `GET` | `/collections/<id>/miniatures/` | ✅ | List miniatures in collection |
| `POST` | `/collections/<id>/miniatures/` | ✅ | Add miniature to collection |
| `GET/PATCH/DELETE` | `/collections/<id>/miniatures/<id>/` | ✅ | Miniature detail |
| `POST` | `/collections/<id>/miniatures/<id>/images/` | ✅ | Upload miniature image |

### Feed (`/collections/feed/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/collections/feed/for-you/` | ✅ | Public feed (all public miniatures) |
| `GET` | `/collections/feed/following/` | ✅ | Feed from followed users only |

### Social (`/collections/social/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/collections/social/like/<miniature_id>/` | ✅ | Toggle like on miniature |
| `POST` | `/collections/social/save/<miniature_id>/` | ✅ | Toggle bookmark on miniature |
| `GET` | `/collections/social/comments/<miniature_id>/` | ✅ | List comments |
| `POST` | `/collections/social/comments/<miniature_id>/` | ✅ | Add comment |
| `DELETE` | `/collections/social/comments/<miniature_id>/<comment_id>/` | ✅ | Delete own comment |
| `POST` | `/collections/social/comment-like/<comment_id>/` | ✅ | Toggle like on comment |
| `POST` | `/collections/social/follow/<user_id>/` | ✅ | Toggle follow on user |
| `GET` | `/collections/social/profile/<username>/` | ✅ | Get user profile with posts/collections |
| `GET` | `/collections/social/saved/` | ✅ | List my bookmarked miniatures |

### Notifications (`/collections/social/notifications/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/collections/social/notifications/` | ✅ | List notifications (paginated) |
| `POST` | `/collections/social/notifications/read/` | ✅ | Mark all as read |
| `GET` | `/collections/social/notifications/unread-count/` | ✅ | Get unread count |

### Achievements (`/collections/social/achievements/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/collections/social/achievements/` | ✅ | All achievements with user progress |
| `POST` | `/collections/social/achievements/check/` | ✅ | Force-check and unlock achievements |

> 📄 **Interactive docs:** Visit http://localhost:8000/swagger/ for the full Swagger UI.

---

## 📂 Project Structure

```
warhammer-portal/
├── README.md
├── docker-compose.yml              # PostgreSQL container
├── setup.sh                        # Automated dev setup script
│
├── backend/
│   ├── .env                        # Environment variables (not in git)
│   ├── .env.example                # Template for .env
│   ├── manage.py                   # Django management
│   ├── requirements.txt            # Python dependencies
│   │
│   ├── config/
│   │   ├── settings/
│   │   │   └── __init__.py         # Environment-aware settings (DEV/QA/PROD)
│   │   ├── urls.py                 # Root URL configuration
│   │   ├── wsgi.py                 # WSGI entry point
│   │   └── asgi.py                 # ASGI entry point
│   │
│   ├── apps/
│   │   ├── users/
│   │   │   ├── models.py           # User + UserProfile models
│   │   │   ├── managers.py         # Custom UserManager (email-based auth)
│   │   │   ├── serializers.py      # Auth, registration, profile serializers
│   │   │   ├── views.py            # Auth endpoints + user search + env info
│   │   │   ├── urls.py             # /api/v1/auth/* routes
│   │   │   ├── permissions.py      # IsAdminRole, IsPremiumRole
│   │   │   ├── signals.py          # Auto-create UserProfile on User creation
│   │   │   └── admin.py            # Django admin configuration
│   │   │
│   │   └── collections/
│   │       ├── models.py           # 16 models (see Data Model below)
│   │       ├── serializers.py      # All collection/social serializers
│   │       ├── views.py            # All collection/feed/social/notification views
│   │       ├── services.py         # Achievement checking + notification creation
│   │       ├── urls.py             # /api/v1/collections/* routes
│   │       ├── admin.py            # Django admin for all models
│   │       └── management/commands/
│   │           ├── seed_game_systems.py    # Seed Warhammer game systems + factions
│   │           └── seed_achievements.py    # Seed 35 achievement definitions
│   │
│   └── media/                      # User-uploaded files (avatars, miniature images)
│
└── frontend/
    ├── .env                        # Dev environment variables
    ├── .env.development            # Explicit dev env
    ├── .env.qa                     # QA build variables
    ├── .env.production             # Production build variables
    ├── .env.example                # Template
    ├── package.json                # Node dependencies + build scripts
    ├── vite.config.js              # Vite configuration (proxy, aliases)
    ├── index.html                  # SPA entry point
    │
    └── src/
        ├── App.jsx                 # Root component + routing
        ├── main.jsx                # React DOM entry
        ├── index.css               # Global styles + Tailwind + CSS variables
        │
        ├── config/
        │   └── environment.js      # Environment detection utility
        │
        ├── services/
        │   └── api.js              # Axios instance with JWT interceptors
        │
        ├── store/
        │   └── authStore.js        # Zustand store (auth, tokens, user)
        │
        ├── components/
        │   ├── AppLayout.jsx       # Authenticated layout (sidebar + mobile nav)
        │   ├── EnvironmentBanner.jsx  # DEV/QA banner
        │   ├── UserSearch.jsx      # Modal user search
        │   ├── Aurora.jsx          # WebGL aurora background
        │   └── auth/               # Auth form components
        │
        └── pages/
            ├── LoginPage.jsx       # Landing + login
            ├── RegisterPage.jsx    # Multi-step registration
            ├── FeedPage.jsx        # Social feed (For You / Following)
            ├── Dashboard.jsx       # Personal dashboard
            ├── CollectionsPage.jsx # My collections
            ├── CollectionDetailPage.jsx  # Collection detail + miniatures
            ├── NewCollectionPage.jsx     # Create collection wizard
            ├── CatalogPage.jsx     # Browse/manage miniature catalog
            ├── ProfilePage.jsx     # User profile (posts/collections/achievements)
            ├── NotificationsPage.jsx     # Notification feed
            └── AchievementsPage.jsx      # Achievement gallery
```

---

## 🗃 Data Model

### Users App

| Model | Description |
|-------|-------------|
| **User** | Custom user (email auth, UUID PK, roles: admin/premium/standard) |
| **UserProfile** | Extended info (favorite game, years in hobby, location, website) |

### Collections App

| Model | Description |
|-------|-------------|
| **GameSystem** | Warhammer 40K, Age of Sigmar, Horus Heresy, etc. |
| **Faction** | Space Marines, Thousand Sons, etc. (linked to GameSystem + category) |
| **Tag** | Searchable tags (Character, Infantry, Vehicle, etc.) |
| **CatalogMiniature** | Master miniature definitions (admin-managed, with tags + images) |
| **Collection** | User's collection (linked to GameSystem + Faction) |
| **Miniature** | User's miniature entry (quantity, paint status, hours, images) |
| **MiniatureImage** | Photos uploaded for a miniature (primary flag) |
| **Follow** | User → User follow relationship |
| **Like** | User → Miniature like |
| **Save** | User → Miniature bookmark |
| **Comment** | User comment on a miniature |
| **CommentLike** | User → Comment like |
| **Notification** | Push notification (like, comment, follow, achievement) |
| **Achievement** | Achievement definition (key, rarity, threshold, points) |
| **UserAchievement** | User's unlocked achievements |

### Entity Relationship (simplified)

```
User ──1:N──▶ Collection ──1:N──▶ Miniature ──1:N──▶ MiniatureImage
  │               │                    │
  │               ├── GameSystem       ├── CatalogMiniature ──M:N── Tag
  │               └── Faction          ├── Like
  │                                    ├── Save
  │                                    └── Comment ──1:N── CommentLike
  │
  ├──1:N──▶ Follow (follower/following)
  ├──1:N──▶ Notification
  └──M:N──▶ Achievement (via UserAchievement)
```

---

## 🌱 Seed Data

```bash
cd backend && source venv/bin/activate

# Seed game systems (Warhammer 40K, AoS, Horus Heresy, etc.)
# Includes all factions organized by Grand Alliance
python manage.py seed_game_systems

# Seed 35 achievement definitions
python manage.py seed_achievements

# Create admin user
python manage.py createsuperuser
```

**Game systems included:**
- Warhammer 40,000 (with 30+ factions across Imperium, Chaos, Xenos)
- Age of Sigmar (Order, Chaos, Death, Destruction factions)
- Horus Heresy
- Kill Team
- Warcry
- Necromunda
- Middle-Earth Strategy Battle Game
- Blood Bowl

---

## 🧪 Testing

```bash
# Backend — Django tests
cd backend && source venv/bin/activate
python manage.py test

# With coverage (install coverage first: pip install coverage)
coverage run manage.py test
coverage report -m

# Frontend — lint
cd frontend
npm run lint

# Frontend — build check (no broken imports)
npm run build
```

### Testing the API manually

1. Open http://localhost:8000/swagger/
2. **Register** via `POST /api/v1/auth/register/`
3. **Login** via `POST /api/v1/auth/login/` → copy the `access` token
4. Click **Authorize** → enter `Bearer <your_access_token>`
5. All authenticated endpoints are now accessible

---

## 🚢 Deployment

### Docker Compose (Full Stack)

Create a production `docker-compose.prod.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: warhammer_portal_prod
      POSTGRES_USER: wh_prod_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - app-network

  backend:
    build: ./backend
    restart: unless-stopped
    env_file:
      - ./backend/.env
    environment:
      - ENVIRONMENT=prod
      - DB_HOST=db
      - DB_PORT=5432
    depends_on:
      - db
    volumes:
      - media_data:/app/media
      - static_data:/app/staticfiles
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      args:
        - VITE_APP_ENV=prod
        - VITE_API_URL=/api/v1
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - media_data:/media
      - static_data:/static
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

volumes:
  postgres_prod_data:
  media_data:
  static_data:

networks:
  app-network:
    driver: bridge
```

**Backend Dockerfile** (`backend/Dockerfile`):

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

RUN python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):

```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .

ARG VITE_APP_ENV=prod
ARG VITE_API_URL=/api/v1
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build:prod

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Deploy:**

```bash
# Build and start
DB_PASSWORD=your-strong-password docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_game_systems
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_achievements
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### Manual Deployment

```bash
# 1. Backend (on your server)
cd backend
source venv/bin/activate
pip install gunicorn

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Start with gunicorn (use systemd/supervisor to keep it running)
gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --timeout 120 \
  --access-logfile /var/log/wh-portal/access.log \
  --error-logfile /var/log/wh-portal/error.log

# 2. Frontend (build and serve with nginx)
cd frontend
npm ci
npm run build:prod
# Copy dist/ to your nginx html directory
```

### Cloud Deployment Notes

| Platform | Backend | Frontend | Database |
|----------|---------|----------|----------|
| **AWS** | ECS/Fargate or EC2 + gunicorn | S3 + CloudFront | RDS PostgreSQL |
| **Google Cloud** | Cloud Run or GCE | Cloud Storage + CDN | Cloud SQL |
| **DigitalOcean** | App Platform or Droplet | Spaces + CDN | Managed DB |
| **Railway** | Auto-deploy from Git | Auto-deploy from Git | Built-in PostgreSQL |
| **Render** | Web Service (Docker) | Static Site | Managed PostgreSQL |
| **Vercel + Railway** | Railway (backend) | Vercel (frontend) | Railway PostgreSQL |

---

## 🔧 Troubleshooting

### `ALLOWED_HOSTS` error when starting backend

```
CommandError: You must set settings.ALLOWED_HOSTS if DEBUG is False.
```

**Cause:** `ENVIRONMENT` is not set or the `settings/` package `__init__.py` is empty.

**Fix:** Ensure `backend/.env` has `ENVIRONMENT=dev` and `DEBUG=True`. Verify that `config/settings/__init__.py` contains the full settings configuration.

### Database connection refused

```
django.db.utils.OperationalError: could not connect to server
```

**Fix:**
```bash
# Check if Docker container is running
docker compose ps

# If not running, start it
docker compose up -d

# Verify connection
docker exec -it wh_portal_db pg_isready -U postgres
```

### Frontend shows blank page

**Fix:** Check browser console for errors. Ensure the backend is running and the Vite proxy is configured to forward `/api` to `http://localhost:8000`.

### CORS errors in the browser

**Fix:** Ensure `CORS_ALLOWED_ORIGINS` in `backend/.env` includes your frontend URL:
```dotenv
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Migrations not applied

```bash
cd backend && source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
```

### Frontend environment banner not showing

Ensure `frontend/.env` has `VITE_APP_ENV=dev`. The banner is **intentionally hidden** in production (`VITE_APP_ENV=prod`).

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- **Backend:** Follow PEP 8, use Django conventions, write serializers for all API responses
- **Frontend:** Functional components + hooks, Zustand for global state, Tailwind for styling
- **Commits:** Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Branches:** `main` (prod), `develop` (dev), `feature/*`, `fix/*`

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built with ❤️ for the Warhammer community</sub>
</p>

