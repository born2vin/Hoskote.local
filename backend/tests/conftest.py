import os
import tempfile

# Must be set before `main`/`app.auth` are imported, since auth.py reads
# SECRET_KEY at module import time.
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000")

_db_fd, _db_path = tempfile.mkstemp(suffix=".db")
os.close(_db_fd)
os.environ["DATABASE_URL"] = f"sqlite:///{_db_path}"

import pytest
from fastapi.testclient import TestClient

import main as main_module
from app.database import SessionLocal, engine
from app.auth import get_current_active_user, get_password_hash
from app.models import Base, User

Base.metadata.create_all(bind=engine)


@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        for table in reversed(Base.metadata.sorted_tables):
            session.execute(table.delete())
        session.commit()
        session.close()


@pytest.fixture
def make_user(db_session):
    """Create and persist a User row, returning the ORM instance."""
    counter = {"n": 0}

    def _make_user(role="Resident", **overrides):
        counter["n"] += 1
        defaults = dict(
            username=f"user{counter['n']}",
            email=f"user{counter['n']}@example.com",
            full_name=f"Test User {counter['n']}",
            hashed_password=get_password_hash("password123"),
            villa_number="101",
            role=role,
        )
        defaults.update(overrides)
        user = User(**defaults)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user

    return _make_user


@pytest.fixture
def client_as():
    """Return a TestClient that authenticates every request as `user`."""
    def _client_as(user):
        main_module.app.dependency_overrides[get_current_active_user] = lambda: user
        return TestClient(main_module.app)

    yield _client_as
    main_module.app.dependency_overrides.clear()
