# Songs Dashboard

A full-stack dashboard for exploring a playlist dataset: a sortable, paginated song table with title search, star ratings, CSV export, and charts covering danceability, duration, acousticness, and tempo. The backend normalizes a columnar JSON dataset into SQLite on startup and serves it through a REST API; the frontend is a React single-page app with client-side routing between the table view and the charts view.

Live demo: TBD

## Running without Docker

### Backend

Requires Python 3.12.

```
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API is served at `http://127.0.0.1:8000`. On first run it creates `backend/songs.db` and loads the playlist data into it; subsequent runs reuse the existing database and do not reload.

### Frontend

Requires Node 20+.

```
cd frontend
npm install
npm run dev
```

The app is served at `http://127.0.0.1:5173` and proxies `/api` requests to the backend at `http://127.0.0.1:8000` during development (see `frontend/vite.config.js`).

## API Reference

All endpoints are prefixed with `/api`.

| Method | Path | Description |
|---|---|---|
| GET | `/songs` | Paginated song list. Query params: `offset` (default 0), `limit` (default 10, max 100), `sort` (any column name, default `id`), `order` (`asc` or `desc`, default `asc`). Returns `{ items, total }`. |
| GET | `/songs/search` | Exact-match title lookup. Query param: `title` (required). Returns the full song object, or 404 if no exact match. |
| GET | `/songs/suggestions` | Partial-match title lookup for typeahead. Query param: `title` (required, min length 1). Returns up to 10 `{ id, title }` matches. |
| PUT | `/songs/{song_id}/rating` | Sets a song's rating. Body: `{ "rating": <int 1-5> }`. Returns the updated song, or 404 if the id does not exist. |

## Testing

### Backend

```
cd backend
venv\Scripts\Activate.ps1
pytest
```

Covers dataset normalization, repository-level database operations, and all API endpoints (list, pagination bounds, search hit/miss, rating happy path/validation).

### Frontend

```
cd frontend
npm test
```

Covers the sort comparator, duration histogram binning, CSV field escaping, and the search-input debounce hook.
