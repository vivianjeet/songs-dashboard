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
| GET | `/songs` | Paginated song list. Query params: `offset` (default 0), `limit` (default 10, max 1000), `sort` (any column name, default `id`), `order` (`asc` or `desc`, default `asc`). Returns `{ items, total }`. |
| GET | `/songs/search` | Exact-match title lookup. Query param: `title` (required). Returns the full song object, or 404 if no exact match. |
| GET | `/songs/suggestions` | Partial-match title lookup for typeahead. Query param: `title` (required, min length 1). Returns up to 10 `{ id, title }` matches. |
| PUT | `/songs/{song_id}/rating` | Sets a song's rating. Body: `{ "rating": <int 1-5> }`. Returns the updated song, or 404 if the id does not exist. |

## Pagination and Data Loading

Pagination happens on the server: `GET /api/songs` accepts `offset`/`limit`/`sort`/`order` and the database does the `ORDER BY`/`LIMIT`/`OFFSET` work, so the client never needs the whole dataset just to render one page of the table.

On the frontend, `SongsContext` (`frontend/src/context/SongsContext.jsx`) fetches only what's needed to show the table, plus one page ahead:

- **Initial load** fetches `offset=0, limit=20` in a single request — the 10 rows for page 1, and the next 10 (page 2) already warmed in the same round trip.
- **Every subsequent page change** fetches just that page (`limit=10`) if it isn't already cached, and then silently prefetches the page after it in the background so it's ready before the user clicks Next again.
- **Sorting** re-fetches from the server with the new `sort`/`order`, since the client only holds a window of rows, not the full ordering — unless every row is already cached locally (see below), in which case it sorts the existing rows in memory instead of making a network call.
- The client-side page cache is capped at **500 rows**. Once exceeded, the oldest-fetched pages are evicted first (the currently visible page and its prefetched neighbor are never evicted).

Some features — the charts view and CSV export — need the entire dataset, not a window of it. Both call a `loadAll()` that pages through the server in 1000-row requests, accumulating until the server-reported total is reached, and fills the cache completely, bypassing the normal per-page fetching and eviction. This is correct for any dataset size rather than assuming everything fits in one request. If the cache is already complete (e.g. Charts is opened right after a CSV export, or vice versa), `loadAll()` is a no-op — it checks the actual cache size against the known total rather than an internal flag, so opening one after the other never makes a redundant API call.

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

Covers the sort comparator (used for in-memory sorting once the full dataset is cached), duration histogram binning, CSV field escaping, the search-input debounce hook, and `SongsContext`'s windowed pagination — initial fetch, page navigation with prefetch, cache reuse on revisited pages, sort-triggered server re-fetch vs. in-memory sort, cache eviction past the 500-row cap, and `loadAll`'s fetch-once/no-op-when-already-full behavior.

## CI/CD

Both test suites run automatically in GitHub Actions on any pull request targeting `main` (`.github/workflows/ci.yml`), as two independent jobs:

- **`backend-tests`**: Python 3.12, `pip install -r requirements.txt`, then `pytest`.
- **`frontend-tests`**: Node 20 (with npm's cache keyed on `frontend/package-lock.json`), `npm ci`, `npm test`, then `npm run build` — the build step also catches anything `npm test` wouldn't (e.g. a broken import that only fails at bundle time).

There is no deployment step in this workflow. Render is configured to auto-deploy each service directly from GitHub on pushes to `main` (via Render's dashboard, not a step in `ci.yml`), so a merge to `main` triggers a live redeploy of whichever service(s) changed once CI has already passed on the pull request.

The working branch model is `develop` → PR → `main`: changes are committed to `develop`, opened as a pull request into `main` (which is what CI runs against), and merged once both jobs pass.

## Toward Production

This was built to satisfy a take-home assignment, so a few things were deliberately left out that a real production system would need.

- No authentication. The API is open and ratings are global rather than tied to a user.
- SQLite instead of a real database. It works well for a fixed, small dataset like this one, but a production deployment with concurrent writers would need something like Postgres.
- Offset-based pagination. Fine here, but would need to move to cursor-based pagination on a dataset that grows or changes while paginating.
- No audit trail on the rating endpoint. There is no record of who changed what or when.
- No monitoring or error tracking on the deployed services, so a real failure would only surface if someone happened to notice it.

## Libraries Used

### Backend

- FastAPI - Web framework and request validation
- Pydantic - Data models and schema validation
- Uvicorn - ASGI server
- Pytest - Test suite

### Frontend

- React - UI framework
- React Router - Client-side routing between the table and charts views
- MUI (Material UI) - Component library
- Recharts - Chart rendering
- Vite - Dev server and build tool
- Vitest + Testing Library - Test suite
- Fontsource (Inter, Source Code Pro) - Self-hosted fonts
