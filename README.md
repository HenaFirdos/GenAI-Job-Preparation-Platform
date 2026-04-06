# Fullstack Deployment Guide

This repository splits the UI and API into two folders so the frontend can live on **Vercel** and the backend can run on **Render**.

## The pieces

- `Frontend/` – Vite + React application. Expects `VITE_API_BASE_URL` to point to the deployed backend.
- `Backend/` – Express/Mongo API. Reads secrets from environment variables and exposes `/health` for sanity checks.

## Environment variables

### Backend (`Backend/.env.example`)

| Key | Description |
| --- | ----------- |
| `PORT` | Render sets this automatically; the example keeps `3000` for local dev. |
| `MONGO_URI` | MongoDB connection string used by `src/config/database.js`. |
| `JWT_SECRET` | Secret for signing access tokens. |
| `GOOGLE_GENAI_API_KEY` | API key for `@google/genai`. |
| `CORS_ORIGINS` | Comma-separated whitelist (e.g., `https://your-app.vercel.app`). Include `*` only if you intend to allow any origin. |

### Frontend (`Frontend/.env.example`)

| Key | Description |
| --- | ----------- |
| `VITE_API_BASE_URL` | The full https:// URL of the Render backend. Defaults to `http://localhost:3000` when omitted, so the dev server works locally. |

## Deploy the backend on Render

1. Create a new **Web Service** that points to the `Backend` folder.
2. Set the Root Directory to `Backend`.
3. Use the `npm install` build command (Render runs this automatically) and set the Start Command to `npm start`.
4. Add the values from `Backend/.env.example`, replacing placeholders with your Mongo URI, secrets, and the Render service URL in `CORS_ORIGINS`.
5. Render provides `PORT` and `NODE_ENV`; the app already respects `process.env.PORT`.
6. Optionally configure a health check to hit `https://<your-service>.onrender.com/health`.

## Deploy the frontend on Vercel

1. Import the project and choose the `Frontend` folder as the root.
2. Framework Preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. Set the Environment Variable `VITE_API_BASE_URL` to the backend URL produced by Render (e.g., `https://<your-service>.onrender.com`).
4. Enable preview deployments as needed; Vercel injects the variable into every build so the frontend targets the live API.

## Local development (optional)

1. Copy `Backend/.env.example` to `Backend/.env` and fill in real credentials.
2. Run `npm run backend` (from root) to start Express, or `npm --prefix Backend run dev` for nodemon auto-reload.
3. In another terminal, run `npm run frontend` (from root) or `npm --prefix Frontend run dev -- --host 0.0.0.0` to start Vite.
4. The UI and API share cookies thanks to `withCredentials` and the whitelist configured through `CORS_ORIGINS`.
