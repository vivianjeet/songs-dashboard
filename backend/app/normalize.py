import json
from pathlib import Path
from app.entities import SongBase

class PlaylistLoader:
    PLAYLIST_PATH = Path(__file__).resolve().parent.parent / "playlist[76][36][48][6][49][41][28][85][7][90][20][31][56][54][1][3][60][34][76][17][31][14][46][57][55][77][84][89][9][1][30][5].json"

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