from fastapi import FastAPI, Query
from pydantic import BaseModel

from app.db import SongRepository
from app.entities import Song

from typing import Literal

app = FastAPI()
repository = SongRepository()


SortColumn = Literal[
    "id", "title", "danceability", "energy", "key", "loudness", "mode",
    "acousticness", "instrumentalness", "liveness", "valence", "tempo",
    "duration_ms", "time_signature", "num_bars", "num_sections",
    "num_segments", "class", "rating",
]

class SongListResponse(BaseModel):
    items: list[Song]
    total: int

@app.on_event("startup")
def startup() -> None:
    repository.init_db()

@app.get("/api/songs", response_model=SongListResponse)
def get_songs(
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    sort: SortColumn = Query("id"),
    order: Literal["asc", "desc"] = Query("asc"),
) -> SongListResponse:
    songs, total = repository.list_songs(offset, limit, sort, order)
    return SongListResponse(items=songs, total=total)