import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import init_db, SessionLocal
from app.db.seed_mock_data import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
