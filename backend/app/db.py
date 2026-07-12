import sqlite3
from pathlib import Path

from app.normalize import PlaylistLoader
from app.entities import Song, SongBase

class SongRepository:
    DB_PATH = Path(__file__).resolve().parent.parent / "songs.db"

    SCHEMA = """
        CREATE TABLE IF NOT EXISTS songs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            danceability REAL,
            energy REAL,
            key INTEGER,
            loudness REAL,
            mode INTEGER,
            acousticness REAL,
            instrumentalness REAL,
            liveness REAL,
            valence REAL,
            tempo REAL,
            duration_ms INTEGER,
            time_signature INTEGER,
            num_bars INTEGER,
            num_sections INTEGER,
            num_segments INTEGER,
            class INTEGER,
            rating INTEGER
        )
    """

    INSERT_ROW = """
        INSERT INTO songs (
            id, title, danceability, energy, key, loudness, mode, acousticness,
            instrumentalness, liveness, valence, tempo, duration_ms, time_signature,
            num_bars, num_sections, num_segments, class, rating
        ) VALUES (
            :id, :title, :danceability, :energy, :key, :loudness, :mode, :acousticness,
            :instrumentalness, :liveness, :valence, :tempo, :duration_ms, :time_signature,
            :num_bars, :num_sections, :num_segments, :class, :rating
        )
    """

    SORTABLE_COLUMNS = {
        "id", "title", "danceability", "energy", "key", "loudness", "mode",
        "acousticness", "instrumentalness", "liveness", "valence", "tempo",
        "duration_ms", "time_signature", "num_bars", "num_sections",
        "num_segments", "class", "rating"
    }

    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
    
    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_db(self) -> None:
        conn = self._get_connection()
        try:
            conn.execute(self.SCHEMA)
            conn.commit()
            row_count = conn.execute("SELECT COUNT(*) FROM songs").fetchone()[0]
            if row_count == 0:
                songs: list[SongBase]= PlaylistLoader().load()
                self._insert_songs(conn, songs)
        finally:
            conn.close()
    
    def _insert_songs(self, conn: sqlite3.Connection, songs: list[SongBase]) -> None:
        for song in songs:
            values = song.model_dump(by_alias=True)
            values["rating"] = None
            conn.execute(self.INSERT_ROW, values)
        conn.commit()
    
    def row_to_song(self, row: sqlite3.Row) -> Song:
         return Song(**dict(row))
    
    def list_songs(self, offset: int, limit: int, sort: str = "id", order: str = "asc") -> tuple[list[Song], int]:
        if sort not in self.SORTABLE_COLUMNS:
            raise ValueError(f"Invalid sort column: {sort}")
        direction = "DESC" if order.lower() == "desc" else "ASC"

        conn = self._get_connection()
        try:
            total = conn.execute("SELECT COUNT(*) FROM songs").fetchone()[0]
            rows = conn.execute(
                f"SELECT * FROM songs ORDER BY {sort} {direction} LIMIT ? OFFSET ?", (limit, offset)
            ).fetchall()
            songs = [self.row_to_song(row) for row in rows]
            return songs, total
        finally:
            conn.close()