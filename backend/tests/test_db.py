from app.db import SongRepository


def test_list_songs_returns_page_and_total(test_repository):
    songs, total = test_repository.list_songs(offset=0, limit=10)
    assert len(songs) == 10
    assert total == 100


def test_list_songs_respects_offset(test_repository):
    first_page, _ = test_repository.list_songs(offset=0, limit=10)
    second_page, _ = test_repository.list_songs(offset=10, limit=10)
    assert first_page[0].id != second_page[0].id


def test_search_by_title_case_insensitive(test_repository):
    song = test_repository.search_by_title("3am")
    assert song is not None
    assert song.title == "3AM"


def test_search_by_title_miss_returns_none(test_repository):
    assert test_repository.search_by_title("nonexistent") is None


def test_update_rating_happy_path(test_repository):
    songs, _ = test_repository.list_songs(offset=0, limit=1)
    song_id = songs[0].id
    updated = test_repository.update_rating(song_id, 4)
    assert updated is not None
    assert updated.rating == 4


def test_update_rating_missing_id_returns_none(test_repository):
    assert test_repository.update_rating("nonexistent-id", 3) is None