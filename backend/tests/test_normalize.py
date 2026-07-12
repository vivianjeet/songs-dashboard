from app.normalize import PlaylistLoader
from app.entities import SongBase

def test_load_returns_all_rows():
    songs = PlaylistLoader().load()
    assert len(songs) == 100

def test_load_returns_song_base_instances():
    songs = PlaylistLoader().load()
    assert all(isinstance(song, SongBase) for song in songs)

def test_known_row_values():
    songs = PlaylistLoader().load()
    first = songs[0]
    assert first.id == "5vYA1mW9g2Coh1HUFUSmlb"
    assert first.title == "3AM"
    assert first.danceability == 0.521
    assert first.energy == 0.673
    assert first.tempo == 108.031
    assert first.duration_ms == 225947
    assert first.class_ == 1