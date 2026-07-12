# Songs Dashboard

A full-stack dashboard for exploring a playlist dataset: a sortable, paginated song table with title search, star ratings, CSV export, and charts covering danceability, duration, acousticness, and tempo. The backend normalizes a columnar JSON dataset into SQLite on startup and serves it through a REST API; the frontend is a React single-page app with client-side routing between the table view and the charts view.

Live demo: [https://songs-dashboard-frontend.onrender.com](https://songs-dashboard-frontend.onrender.com)

Backend API docs: [https://songs-dashboard-mg3x.onrender.com/docs](https://songs-dashboard-mg3x.onrender.com/docs)

Both services run on Render's free tier and sleep after inactivity. The first request after a period of idle time can take 30 to 60 seconds while the instance wakes up; subsequent requests are fast. If the backend has been idle, open its `/docs` link above directly first to wake it before using the live demo, since the frontend's first API call may time out while the backend is still starting.

## Running with Docker

From the repository root, build and run each service:

```
docker build -t songs-backend ./backend
docker run -p 8000:8000 songs-backend

docker build --build-arg VITE_API_URL=http://127.0.0.1:8000 -t songs-frontend ./frontend
docker run -p 8080:80 songs-frontend
```

The backend is served at `http://127.0.0.1:8000` and the frontend at `http://127.0.0.1:8080`. `VITE_API_URL` is a build-time argument since Vite bakes it into the static bundle; the frontend image must be rebuilt if the backend's address changes.

## Running without Docker

### Backend

Requires Python 3.12.

```
cd backend
python -m venv venv
```

On Windows:

```
venv\Scripts\Activate.ps1
```

On macOS/Linux:

```
source venv/bin/activate
```

Then, on either platform:

```
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
pytest
```

(activate the virtual environment first, as shown above)

Covers dataset normalization, repository-level database operations, and all API endpoints (list, pagination bounds, search hit/miss, rating happy path/validation).

### Frontend

```
cd frontend
npm test
```

Covers the sort comparator, duration histogram binning, CSV field escaping, and the search-input debounce hook.

Both test suites also run automatically in GitHub Actions on any pull request targeting `main` (`.github/workflows/ci.yml`).

## Toward Production

This was built to satisfy a take-home assignment, so a few things were deliberately left out that a real production system would need.

- No authentication. The API is open and ratings are global rather than tied to a user.
- SQLite instead of a real database. It works well for a fixed, small dataset like this one, but a production deployment with concurrent writers would need something like Postgres.
- Offset-based pagination. Fine here, but would need to move to cursor-based pagination on a dataset that grows or changes while paginating.
- No audit trail on the rating endpoint. There is no record of who changed what or when.
- No monitoring or error tracking on the deployed services, so a real failure would only surface if someone happened to notice it.

## Libraries Used

### Backend

- FastAPI - web framework and request validation
- Pydantic - data models and schema validation
- Uvicorn - ASGI server
- pytest - test suite

### Frontend

- React - UI framework
- React Router - client-side routing between the table and charts views
- MUI (Material UI) - component library
- Recharts - chart rendering
- Vite - dev server and build tool
- Vitest + Testing Library - test suite
- Fontsource (Inter, Source Code Pro) - self-hosted fonts
