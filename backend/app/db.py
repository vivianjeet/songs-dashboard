import sqlite3
from contextlib import contextmanager
from pathlib import Path

from app.normalize import PlaylistLoader, SORTABLE_COLUMNS
from app.entities import Song, SongBase, SongSuggestion

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

    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
    
    @contextmanager
    def _connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def init_db(self) -> None:
        with self._connection() as conn:
            conn.execute(self.SCHEMA)
            conn.commit()
            row_count = conn.execute("SELECT COUNT(*) FROM songs").fetchone()[0]
            if row_count == 0:
                songs: list[SongBase] = PlaylistLoader().load()
                self._insert_songs(conn, songs)

    def _insert_songs(self, conn: sqlite3.Connection, songs: list[SongBase]) -> None:
        for song in songs:
            values = song.model_dump(by_alias=True)
            values["rating"] = None
            conn.execute(self.INSERT_ROW, values)
        conn.commit()
    
    def row_to_song(self, row: sqlite3.Row) -> Song:
         return Song(**dict(row))
    
    def list_songs(self, offset: int, limit: int, sort: str = "id", order: str = "asc") -> tuple[list[Song], int]:
        if sort not in SORTABLE_COLUMNS:
            raise ValueError(f"Invalid sort column: {sort}")
        direction = "DESC" if order.lower() == "desc" else "ASC"

        with self._connection() as conn:
            total = conn.execute("SELECT COUNT(*) FROM songs").fetchone()[0]
            rows = conn.execute(
                f"SELECT * FROM songs ORDER BY {sort} {direction} LIMIT ? OFFSET ?", (limit, offset)
            ).fetchall()
            songs = [self.row_to_song(row) for row in rows]
            return songs, total

    def search_by_title(self, title: str) -> Song | None:
        with self._connection() as conn:
            row = conn.execute(
                "SELECT * FROM songs WHERE title = ? COLLATE NOCASE", (title,)
            ).fetchone()
            return self.row_to_song(row) if row else None

    def suggest_titles(self, query: str, limit: int = 10) -> list[SongSuggestion]:
        with self._connection() as conn:
            rows = conn.execute(
                "SELECT id, title FROM songs WHERE title LIKE ? COLLATE NOCASE ORDER BY title LIMIT ?", (f"%{query}%", limit)
            ).fetchall()
            return [SongSuggestion(id=row["id"], title=row["title"]) for row in rows]

    def update_rating(self, song_id: str, rating: int) -> Song | None:
        with self._connection() as conn:
            cursor = conn.execute(
                "UPDATE songs SET rating = ? WHERE id = ? RETURNING *", (rating, song_id)
            )
            row = cursor.fetchone()
            conn.commit()
            return self.row_to_song(row) if row else None
