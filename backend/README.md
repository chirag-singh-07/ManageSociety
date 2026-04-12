# ManageSociety Backend

## Setup
- Copy `.env.example` to `.env` and fill values.
- Ensure MongoDB is running and `MONGODB_URI` points to it.

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

