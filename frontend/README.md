# Snip frontend

A responsive React + TypeScript dashboard for the URL shortener API.

## Run locally

1. Start the Spring Boot backend on `http://localhost:8080`.
2. From this folder, install dependencies and start Vite:

   ```sh
   npm install
   npm run dev
   ```

The frontend `.env` file sets `VITE_API_URL=http://localhost:8080`, which points the browser directly to the local backend. Vite loads this value when it builds the app, including in the Docker image. Set `VITE_API_URL` in this file to change the API origin.

When running with the root `docker-compose.yml`, the frontend's Nginx server proxies `/api` requests to the `app` backend service. Rebuild/recreate the frontend container after changing `frontend/nginx.conf`:

```sh
docker compose up --build
```

## API configuration

- `VITE_API_URL` sets the API origin and is read from `frontend/.env` at build time. Set it to the public API origin for cloud deployments, then rebuild the frontend.
- The backend allows browser requests from `http://localhost:3000` by default. To allow a different frontend origin, set `CORS_ALLOWED_ORIGINS` in the root `.env` file (comma-separated for multiple origins).
- `VITE_PUBLIC_SHORT_URL_BASE` optionally sets the public origin used when displaying and copying short links. By default, links use the current site origin and the backend redirect route (`/api/v1/urls/{shortCode}`).

The dashboard uses the API's existing login/register, create URL, personal URL list, delete, and per-link stats endpoints. Click totals reflect the backend's available lifetime counts; the backend does not currently expose time-series analytics.
