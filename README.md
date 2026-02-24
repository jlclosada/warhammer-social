# Warhammer Portal

A SaaS platform for managing Warhammer miniature collections across multiple game systems.

## Tech Stack

- **Backend:** Django 5 + Django REST Framework + PostgreSQL
- **Frontend:** React 19 + Tailwind CSS 4 + Framer Motion
- **Auth:** JWT (SimpleJWT) with token rotation and blacklisting
- **API Docs:** Swagger (drf-yasg)

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Full system access, user management |
| `premium` | Unlimited collections, advanced features |
| `standard` | Basic access, limited collections |

---

## Quick Start (Development)

### 1. Start PostgreSQL

```bash
cd warhammer-portal
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Seed game systems
python manage.py seed_game_systems

# Start server
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

- **Admin panel:** http://localhost:8000/admin/
- **Swagger UI:** http://localhost:8000/swagger/
- **ReDoc:** http://localhost:8000/redoc/

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register/` | Create new account |
| POST | `/api/v1/auth/login/` | Login (returns JWT + user) |
| POST | `/api/v1/auth/login/refresh/` | Refresh access token |
| POST | `/api/v1/auth/logout/` | Logout (blacklist token) |
| GET | `/api/v1/auth/me/` | Get current user |
| PUT/PATCH | `/api/v1/auth/me/` | Update profile |
| POST | `/api/v1/auth/me/change-password/` | Change password |

### Testing with Swagger

1. Go to http://localhost:8000/swagger/
2. Use the `/auth/login/` endpoint to get tokens
3. Click "Authorize" button, enter: `Bearer <your_access_token>`
4. Now all authenticated endpoints are accessible

---

## Project Structure

```
warhammer-portal/
├── docker-compose.yml
├── backend/
│   ├── .env
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── apps/
│       ├── users/
│       │   ├── models.py        # Custom User + UserProfile
│       │   ├── managers.py      # Custom UserManager
│       │   ├── serializers.py   # Auth & user serializers
│       │   ├── views.py         # Auth endpoints
│       │   ├── urls.py
│       │   ├── admin.py
│       │   ├── permissions.py   # Role-based permissions
│       │   └── signals.py       # Auto-create profile
│       └── collections/
│           ├── models.py        # GameSystem, Collection, Miniature
│           ├── admin.py
│           └── urls.py
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── store/
        │   └── authStore.js     # Zustand auth state
        ├── services/
        │   └── api.js           # Axios with interceptors
        ├── pages/
        │   ├── LandingPage.jsx
        │   └── Dashboard.jsx
        └── components/
            ├── auth/
            │   └── AuthModal.jsx
            └── landing/
                ├── HeroSection.jsx
                ├── FeaturesSection.jsx
                └── Footer.jsx
```

