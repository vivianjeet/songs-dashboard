import pytest
from fastapi.testclient import TestClient

from app.db import SongRepository
from app.main import app, repository

@pytest.fixture
def test_repository(tmp_path):
    db_path = tmp_path / "test_songs.db"
    repo = SongRepository(db_path=db_path)
    repo.init_db()
    return repo

@pytest.fixture
def client(test_repository, monkeypatch):
    monkeypatch.setattr("app.main.repository", test_repository)
    with TestClient(app) as c:
        yield c