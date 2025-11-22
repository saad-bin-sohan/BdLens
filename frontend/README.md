# TownLens Frontend

Next.js frontend for TownLens document search and browsing.

## Features

- Server-side rendered pages for SEO and performance
- Responsive design with TailwindCSS
- ShadCN UI components
- Authentication with JWT cookies
- Semantic search interface
- Document browsing and detail views
- Admin dashboard for source management

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

For production, set this to your deployed backend URL.

### 3. Run Development Server

```bash
npm run dev
```

Application will be available at http://localhost:3000

### 4. Build for Production

```bash
npm run build
npm start
```

## Deployment (Vercel)

### Via Vercel Dashboard

1. Import your GitHub repository in Vercel
2. Set the root directory to `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_BASE_URL`: Your deployed backend URL (e.g., `https://townlens-api.onrender.com`)
4. Deploy

### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# For production
vercel --prod
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (authenticated)/    # Protected routes
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── documents/      # Document pages
│   │   │   └── search/         # Search page
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   ├── components/             # React components
│   │   ├── ui/                 # ShadCN UI components
│   │   └── navbar.tsx          # Navigation
│   └── lib/                    # Utilities
│       ├── api.ts              # API client
│       └── utils.ts            # Helper functions
├── package.json
└── tailwind.config.ts
```

## Environment Variables

### Required

- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **ShadCN UI**: Component library
- **Lucide React**: Icons

## Pages

### Public
- `/login` - User login
- `/register` - User registration

### Authenticated
- `/` - Home dashboard
- `/documents` - Browse all documents
- `/documents/[id]` - Document detail view
- `/search` - Semantic search

### Admin Only
- `/admin` - Admin dashboard
- `/admin/sources` - Manage crawl sources
- `/admin/upload` - Upload PDFs
- `/admin/analytics` - View usage analytics
