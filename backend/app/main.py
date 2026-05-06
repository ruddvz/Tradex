"""
Tradex Backend API
AI-Powered Trading Journal Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings
from .api.v1.routes import router

app = FastAPI(
    title="Tradex API",
    description="AI-Powered Trading Journal Platform — Forex, Gold, Indices & Stocks",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(router)


@app.get("/")
async def root():
    return {
        "name": "Tradex API",
        "version": "1.0.0",
        "description": "AI-Powered Trading Journal Platform",
        "docs": "/docs",
        "health": "/api/v1/health",
    }


@app.exception_handler(404)
async def not_found(request, exc):
    return JSONResponse(status_code=404, content={"detail": "Not found"})


@app.exception_handler(500)
async def internal_error(request, exc):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
