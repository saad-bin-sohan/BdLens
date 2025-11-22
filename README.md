# TownLens

An open-source web application for ingesting, searching, and understanding local government documents.

## Features

- **Document Ingestion**: Scrape city websites and manually upload PDFs
- **Semantic Search**: Natural language search powered by AI embeddings
- **AI Summaries**: Automatic plain-language summaries and explanations
- **Smart Tagging**: Auto-tag documents by topic and extract entities
- **Admin Dashboard**: Manage sources, trigger crawls, view analytics
- **Secure Auth**: Email/password authentication with admin controls

## Tech Stack

### Backend
- FastAPI (Python)
- PostgreSQL with pgvector
- SQLAlchemy + Alembic
- Google Gemini API (free tier)

### Frontend
- Next.js (App Router)
- TypeScript
- TailwindCSS + ShadCN UI

## Project Structure

```
/backend         # FastAPI application
/frontend        # Next.js application
/storage         # Local file storage (PDFs)
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ with pgvector extension
- Google Gemini API key (free tier)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

Backend will be available at http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Frontend will be available at http://localhost:3000

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@localhost/townlens
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secret_key
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Deployment

### Backend (Render)

See [backend/README.md](backend/README.md) for Render deployment instructions.

### Frontend (Vercel)

See [frontend/README.md](frontend/README.md) for Vercel deployment instructions.

## License

MIT
