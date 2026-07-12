from pydantic import BaseModel, Field

class SongBase(BaseModel):
    id: str
    title: str
    danceability: float
    energy: float
    key: int
    loudness: float
    mode: int
    acousticness: float
    instrumentalness: float
    liveness: float
    valence: float
    tempo: float
    duration_ms: int
    time_signature: int
    num_bars: int
    num_sections: int
    num_segments: int
    class_: int = Field(alias="class")
    model_config = {"populate_by_name": True}

class Song(SongBase):
    rating: int | None = None

class SongSuggestion(BaseModel):
    id: str
    title: str

class RatingUpdate(BaseModel):
    rating: int = Field(ge=1, le=5)