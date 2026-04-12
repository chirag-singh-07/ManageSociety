# ManageSociety Backend

## Setup
- Copy `.env.example` to `.env` and fill values.
- Ensure MongoDB is running and `MONGODB_URI` points to it.

## Docs
- API & architecture: `API.md`

## Deploy to Render
- A Render Blueprint is included at repo root: `render.yaml`
- Set required env vars in Render (at minimum `MONGODB_URI`)
- `healthCheckPath` is `/health`
- Optional keep-alive cron: set `PING_URL` to your API base URL (e.g. `https://your-service.onrender.com`)

## Run
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm start`

## Tests
This test suite needs MongoDB.

- Option A (recommended on Windows): run a local MongoDB service, then:
  - PowerShell:
    - `$env:MONGODB_URI_TEST="mongodb://127.0.0.1:27017/managesociety_test"`
    - `npm test`

- Option B: use `mongodb-memory-server` (may be blocked on some Windows setups):
  - `$env:MONGODB_MEMORY_SERVER="1"`
  - `npm test`
