# URL Shortener

A full-stack URL shortener with an authenticated dashboard for creating and managing links.

## Features

- Register and sign in
- Create short links with an optional custom alias and expiration
- Redirect short links to their original URLs
- View and manage your links, including click counts

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Backend | Java 21, Spring Boot |
| Data and cache | MySQL 8, Redis |
| Routing and deployment | Nginx, Docker Compose |

## Run with Docker Compose

You will need [Docker](https://www.docker.com/) with Docker Compose.

From the project root, build and start the application:

```sh
docker compose up --build
```

Open [http://localhost](http://localhost) in your browser. The Compose setup starts the frontend, backend, MySQL, Redis, and reverse proxy.

To stop the application, press `Ctrl+C`, then run:

```sh
docker compose down
```

MySQL data is stored in the `mysql_data` volume and is preserved when containers stop.

## Run locally

For local development, install Java 21, Node.js, MySQL 8, and Redis. Create the `url_shortener_db` database, and configure the MySQL credentials in `backend/url-shortener/src/main/resources/application.properties`.

1. Start MySQL on `localhost:3306` and Redis on `localhost:6379`.
2. In a terminal, start the backend:

   ```sh
   cd backend/url-shortener
   .\mvnw.cmd spring-boot:run
   ```

3. In another terminal, start the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` requests to `http://localhost:8080` by default. To use a different backend address, set `BACKEND_URL` in `frontend/.env`.
