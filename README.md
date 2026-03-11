# TSC Docs

A personal documentation and flow-builder tool backed by MongoDB Atlas.

---

## Project Structure

```
tsc-docs/
├── server/
│   ├── index.js        ← Express entry point
│   ├── routes.js       ← REST API routes
│   ├── models.js       ← Mongoose schema
│   ├── package.json
│   └── .env.example    ← Copy to .env and fill in your URI
└── client/
    └── index.html      ← Full frontend (served by Express)
```

---

## Setup

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Add your MongoDB URI

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder with your Atlas connection string:

```
MONGODB_URI=mongodb+srv://yourUser:yourPassword@yourCluster.mongodb.net/tsc-docs?retryWrites=true&w=majority
PORT=4000
```

> **Tip:** In MongoDB Atlas → Clusters → Connect → "Connect your application" → copy the connection string.
> Make sure your IP is whitelisted in Atlas → Network Access.

### 3. Run

```bash
# Development (auto-restarts on changes)
npm run dev

# Production
npm start
```

### 4. Open in browser

```
http://localhost:4000
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/items | Get all items (optional ?type=flows) |
| GET | /api/items/:id | Get single item |
| POST | /api/items | Create item { title, type } |
| PATCH | /api/items/:id | Update fields |
| DELETE | /api/items/:id | Delete item |

---

## Deploy

To deploy (e.g. Railway, Render, Fly.io):
1. Set the `MONGODB_URI` and `PORT` environment variables on the platform
2. Set start command to `node server/index.js`
3. The Express server serves both the API and the frontend from one process
