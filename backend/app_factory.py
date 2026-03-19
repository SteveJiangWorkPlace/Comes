from __future__ import annotations

import warnings

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic.warnings import ArbitraryTypeWarning

warnings.filterwarnings("ignore", category=UserWarning, module=r"pydantic\._internal\._generate_schema")
warnings.filterwarnings("ignore", message=r".*built-in function any.*", module=r"pydantic\._internal\._generate_schema")
warnings.filterwarnings("ignore", category=ArbitraryTypeWarning)

from backend.routers.common import router as common_router
from backend.routers.ps_edit import router as ps_edit_router
from backend.routers.writing import router as writing_router


def create_app() -> FastAPI:
    app = FastAPI(title="PSR API", version="1.2.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(common_router)
    app.include_router(ps_edit_router)
    app.include_router(writing_router)
    return app
