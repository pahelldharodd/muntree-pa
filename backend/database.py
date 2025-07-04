from sqlmodel import SQLModel, create_engine, Session
from backend.config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    from backend.models import Link, Admin
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
