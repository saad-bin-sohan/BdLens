# BdLens Backend

FastAPI backend for BdLens document ingestion and search system.

## Setup

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Your Google Gemini API key
- `JWT_SECRET`: Random secret key for JWT tokens
- `ALLOWED_ORIGINS`: Frontend URLs (comma-separated)

### 3. Setup Database

Ensure PostgreSQL is running with pgvector extension:

```sql
CREATE DATABASE BdLens;
\c BdLens
CREATE EXTENSION vector;
```

### 4. Run Migrations

```bash
alembic upgrade head
```

### 5. Create Initial Admin User

After starting the server, register a user via `/api/auth/register`, then manually set them as admin in the database:

```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

### 6. Start Server

```bash
uvicorn app.main:app --reload
```

API will be available at http://localhost:8000

API documentation: http://localhost:8000/docs

## Deployment (Render)

### Option 1: Using Docker

Create a `Dockerfile` (see deployment section in main README).

### Option 2: Direct Python

In Render dashboard:
- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Set environment variables in Render dashboard.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - List documents (with filters)
- `GET /api/documents/{id}` - Get document details
- `POST /api/documents/{id}/regenerate-summary` - Regenerate AI summary (admin)
- `GET /api/documents/tags/list` - List all tags

### Search
- `GET /api/search?q={query}` - Semantic search

### Admin
- `GET /api/admin/sources` - List sources
- `POST /api/admin/sources` - Create source
- `PUT /api/admin/sources/{id}` - Update source
- `POST /api/admin/sources/{id}/crawl` - Trigger crawl
- `GET /api/admin/crawl-jobs` - List crawl jobs
- `POST /api/admin/documents/upload` - Upload PDF
- `GET /api/admin/analytics/overview` - Analytics overview

## Project Structure

```
backend/
├── alembic/              # Database migrations
├── app/
│   ├── auth/             # Authentication logic
│   ├── db/               # Database setup
│   ├── ingestion/        # Scraping framework
│   ├── models/           # SQLAlchemy models
│   ├── routes/           # API routes
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── config.py         # Configuration
│   └── main.py           # FastAPI app
└── requirements.txt      # Python dependencies
```
