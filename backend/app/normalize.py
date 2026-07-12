import json
from pathlib import Path
from app.entities import SongBase

class PlaylistLoader:
    PLAYLIST_PATH = Path(__file__).resolve().parent.parent / "playlist.json"

    def __init__(self, path: Path = PLAYLIST_PATH):
        self.path = path

    def load(self) -> list[SongBase]:
        with open(self.path, "r", encoding="utf-8") as f:
            columnar = json.load(f)

        columns = list(columnar.keys())
        row_ids = list(columnar[columns[0]].keys())

        rows = []
        for row_id in row_ids:
            raw = {col: columnar[col][row_id] for col in columns}
            rows.append(SongBase(**raw))
        
        return rows