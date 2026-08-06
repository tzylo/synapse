from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.db.session import get_db
from src.db.database import engine, Base
from src.models.knowledge_node import KnowledgeNode

from src.api.memory import router as memory_router

app = FastAPI()

app.include_router(memory_router)


@app.on_event("startup")
async def startup():
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.commit()
        Base.metadata.create_all(bind=engine)
    except Exception as err:
        print(f"[DB INIT ERROR] Could not initialize database tables: {err}")



@app.get("/")
def root():
    return {
        "service": "Tzylo AI Service",
        "status": "running"
    }

@app.get("/health/db")
def health(db: Session = Depends(get_db)):
    try:
        # Perform a simple query to check database connectivity
        db.execute(text("SELECT 1"))
        return {"status": "healthy"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}