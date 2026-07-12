def test_get_songs_default_pagination(client):
    response = client.get("/api/songs")
    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) == 10
    assert body["total"] == 100


def test_get_songs_pagination_bounds(client):
    response = client.get("/api/songs?offset=95&limit=10")
    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) == 5


def test_get_songs_invalid_sort_returns_422(client):
    response = client.get("/api/songs?sort=nonsense")
    assert response.status_code == 422


def test_search_hit(client):
    response = client.get("/api/songs/search?title=3AM")
    assert response.status_code == 200
    assert response.json()["title"] == "3AM"


def test_search_miss_returns_404(client):
    response = client.get("/api/songs/search?title=nonexistent")
    assert response.status_code == 404


def test_rating_happy_path(client):
    songs = client.get("/api/songs?offset=0&limit=1").json()["items"]
    song_id = songs[0]["id"]
    response = client.put(f"/api/songs/{song_id}/rating", json={"rating": 5})
    assert response.status_code == 200
    assert response.json()["rating"] == 5


def test_rating_validation_failure(client):
    songs = client.get("/api/songs?offset=0&limit=1").json()["items"]
    song_id = songs[0]["id"]
    response = client.put(f"/api/songs/{song_id}/rating", json={"rating": 0})
    assert response.status_code == 422


def test_rating_missing_song_returns_404(client):
    response = client.put("/api/songs/nonexistent-id/rating", json={"rating": 3})
    assert response.status_code == 404