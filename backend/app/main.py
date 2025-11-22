from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.base import init_pgvector

app = FastAPI(
    title="BdLens API",
    description="API for ingesting, searching, and understanding local government documents",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    init_pgvector()


@app.get("/")
async def root():
    return {
        "name": "BdLens API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Import and include routers
from app.routes import auth, documents, search, admin

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
