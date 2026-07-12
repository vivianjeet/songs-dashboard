from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel

from app.db import SongRepository
from app.entities import Song, SongSuggestion, RatingUpdate

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

@app.get("/api/songs/search", response_model=Song)
def search_songs(title: str = Query(...)) -> Song:
    song = repository.search_by_title(title)
    if song is None:
        raise HTTPException(status_code=404, detail=f"Song with title '{title}' not found")
    return song

@app.get("/api/songs/suggestions", response_model=list[SongSuggestion])
def suggest_songs(title: str = Query(..., min_length=1)) -> list[SongSuggestion]:
    return repository.suggest_titles(title)

@app.put("/api/songs/{song_id}/rating", response_model=Song)
def rate_song(song_id: str, body: RatingUpdate) -> Song:
    song = repository.update_rating(song_id, body.rating)
    if song is None:
        raise HTTPException(status_code=404, detail=f"Song with id '{song_id}' not found")
    return song