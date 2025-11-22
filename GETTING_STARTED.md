# Getting Started with BdLens

This guide will help you get BdLens running locally in under 15 minutes.

## Quick Start Checklist

- [ ] PostgreSQL 14+ installed with pgvector
- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Google Gemini API key obtained

## Step-by-Step Setup

### 1. Clone and Setup Database

```bash
# Create PostgreSQL database
createdb BdLens

# Enable pgvector extension
psql BdLens -c "CREATE EXTENSION vector;"
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/BdLens
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_random_secret_key_here
ALLOWED_ORIGINS=http://localhost:3000
```

Get a Gemini API key: https://makersuite.google.com/app/apikey

```bash
# Run migrations
alembic upgrade head

# Start backend
uvicorn app.main:app --reload
```

Backend is now running at http://localhost:8000

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

```bash
# Start frontend
npm run dev
```

Frontend is now running at http://localhost:3000

### 4. Create Your Account

1. Open http://localhost:3000 in your browser
2. Click "Register"
3. Create an account with email and password
4. You'll be redirected to login

### 5. Make Yourself Admin

```bash
# In PostgreSQL
psql BdLens

# Run this SQL (replace with your email)
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

### 6. Try It Out

Now you can:

1. **Upload a PDF**
   - Go to Admin → Upload Document
   - Select a PDF file
   - Wait for processing (~30 seconds)
   - View the auto-generated summary and tags

2. **Add a Source**
   - Go to Admin → Manage Sources
   - Click "New Source"
   - Example: Name: "Test Site", URL: "https://example.com"
   - Click "Crawl" to test ingestion

3. **Search**
   - Go to Search
   - Enter a natural language query
   - See semantic search results

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         BdLens                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (Next.js)                                          │
│  ├── Authentication Pages     (/login, /register)           │
│  ├── Document Browser         (/documents)                  │
│  ├── Semantic Search          (/search)                     │
│  └── Admin Dashboard          (/admin)                      │
│      ├── Source Management                                  │
│      ├── PDF Upload                                         │
│      └── Analytics                                          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Backend (FastAPI)                                           │
│  ├── Auth API                 (JWT + cookies)               │
│  ├── Documents API            (CRUD, search)                │
│  ├── Admin API                (sources, upload, analytics)  │
│  └── Services                                               │
│      ├── AI Provider          (Gemini integration)          │
│      ├── PDF Extractor        (text extraction)             │
│      ├── Document Processor   (analysis pipeline)           │
│      └── Scraper Framework    (web crawling)                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Database (PostgreSQL + pgvector)                            │
│  ├── Users & Auth                                           │
│  ├── Documents & Sections                                   │
│  ├── Tags & Entities                                        │
│  ├── Sources & Crawl Jobs                                   │
│  ├── Vector Embeddings        (semantic search)             │
│  └── Analytics Events                                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  External Services                                           │
│  └── Google Gemini API        (summaries, tags, embeddings) │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## How It Works

### Document Ingestion Flow

1. **Upload or Crawl**
   - User uploads PDF or admin triggers crawl
   - PDF text extracted or HTML content scraped

2. **AI Analysis** (via Gemini)
   - Generate plain-language summary (2-3 sentences)
   - Generate detailed explanation (longer breakdown)
   - Classify into topic tags (housing, transport, etc.)
   - Extract named entities (organizations, places, etc.)

3. **Vector Embeddings**
   - Document split into sections (~800 chars each)
   - Each section embedded into 768-dim vector
   - Stored in PostgreSQL with pgvector

4. **Indexing**
   - Document saved with all metadata
   - Tags and entities linked
   - Vector index created for fast search

### Semantic Search Flow

1. **Query Embedding**
   - User enters natural language query
   - Query embedded into 768-dim vector (Gemini)

2. **Vector Search**
   - pgvector performs cosine similarity search
   - Returns top N most relevant document sections
   - Ordered by similarity score

3. **Results**
   - Display matching documents with snippets
   - Show relevance scores and tags
   - Link to full document view

## Development Workflow

### Adding a New Feature

1. **Backend**: Add route in `backend/app/routes/`
2. **Frontend**: Add page in `frontend/src/app/`
3. **API Client**: Add method in `frontend/src/lib/api.ts`
4. **Test locally**: Use both dev servers
5. **Deploy**: Push to GitHub, auto-deploys to Render/Vercel

### Database Changes

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Review migration in alembic/versions/

# Apply migration
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

### Testing with Real Data

1. Find a local government website with public notices
2. Add as source in admin panel
3. Trigger crawl (limited to 10 docs for free tier)
4. View ingested documents
5. Try searching for topics

## Common Issues

### "Module not found" errors
```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Database connection errors
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
# Format: postgresql://user:password@host:port/database
```

### Gemini API errors
- Check API key is valid
- Verify you're on the free tier
- Check rate limits (60 req/min)

### Frontend can't reach backend
- Verify backend is running on port 8000
- Check NEXT_PUBLIC_API_BASE_URL in .env.local
- Check CORS settings in backend .env

## Next Steps

### Customize for Your Use Case

1. **Add Your City's Sources**
   - Find government notice websites
   - Add as sources in admin
   - Configure URL patterns if needed

2. **Adjust AI Prompts**
   - Edit prompts in `backend/app/services/ai_provider.py`
   - Customize for your document types
   - Adjust tag categories

3. **Customize UI**
   - Modify colors in `frontend/tailwind.config.ts`
   - Update branding in navbar
   - Add custom components

4. **Add Features**
   - Email notifications for new documents
   - Saved searches
   - Document collections
   - Export functionality

## Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Next.js Docs**: https://nextjs.org/docs
- **pgvector Guide**: https://github.com/pgvector/pgvector
- **Gemini API**: https://ai.google.dev/docs
- **ShadCN UI**: https://ui.shadcn.com

## Support

For issues or questions:
1. Check logs in terminal
2. Review error messages
3. Check this documentation
4. Verify environment variables

## License

MIT License - see LICENSE file for details
