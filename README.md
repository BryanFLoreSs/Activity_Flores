# ScholarSpace Student Information System

A Next.js frontend and Laravel REST API for student accounts and student records. Laravel uses Supabase PostgreSQL as its default database and a separately configured MySQL connection for the physical Windows LAN database.

## Local setup

Requirements: Node.js, PHP 8.3+, Composer, a Supabase PostgreSQL project, and (for the physical database activity) a trusted local network connection to the Windows MySQL server.

1. Copy `backend/.env.example` to `backend/.env`. Add the PostgreSQL host, database, username, and password from Supabase. Keep these credentials private. Set `APP_KEY` with `php artisan key:generate` from the backend folder.
2. Copy `frontend/.env.example` to `frontend/.env.local`. The default API URL is `http://127.0.0.1:8000/api`.
3. In `backend`, install dependencies with `composer install`, then run `php artisan migrate --seed`. Migrations and sample cloud student records target the configured PostgreSQL database.
4. In `backend`, set `LOCAL_MYSQL_HOST`, `LOCAL_MYSQL_PORT`, `LOCAL_MYSQL_DATABASE`, `LOCAL_MYSQL_USERNAME`, and `LOCAL_MYSQL_PASSWORD` to the trusted LAN MySQL server. Run `database/physical_mysql.sql` on that Windows server. Use a restricted application account and firewall access limited to the development computer or trusted lab subnet.
5. Set `FRONTEND_URL=http://localhost:3000` in the backend environment. Start Laravel with `php artisan serve --host=127.0.0.1 --port=8000`.
6. In `frontend`, run `npm install` and `npm run dev`, then open `http://localhost:3000`.

Register an account, sign in, and choose **Supabase cloud** or **Physical MySQL** from the dashboard source selector. The `GET /api/physical-students` endpoint is also protected and is useful for demonstrating the LAN connection.

## API overview

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/register` | Public, rate limited | Create account and return a Sanctum token |
| POST | `/api/login` | Public, rate limited | Verify credentials and return a token |
| GET | `/api/me` | Bearer token | Return the authenticated user |
| GET | `/api/students?source=cloud` | Bearer token | Read Supabase student records |
| GET | `/api/students?source=physical` | Bearer token | Read the physical MySQL records |
| GET | `/api/physical-students` | Bearer token | Physical database demonstration endpoint |
| POST | `/api/logout` | Bearer token | Revoke the current token |

Laravel validates the source against the two supported values and selects the database connection server-side. Passwords are hashed by Laravel before storage and never included in responses. The frontend stores its classroom bearer token in `sessionStorage`; for production, move authentication to secure HttpOnly cookies through a same-origin backend-for-frontend pattern.

## Cloud deployment

### Vercel

Import the repository and set the project root to `frontend`. Set `NEXT_PUBLIC_API_URL` to `https://YOUR-RENDER-SERVICE.onrender.com/api`. Deploy, then set `FRONTEND_URL` on the backend to the actual Vercel origin.

### Render

Create a Docker Web Service with the root directory set to `backend` and the Dockerfile path set to `Dockerfile`. Configure `APP_KEY`, `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, the Supabase `DB_*` values, and `FRONTEND_URL` in Render. Set the pre-deploy command to `php artisan migrate --force`. To load the two sample cloud records, run `php artisan db:seed --force` after the table exists.

The Docker image enables PostgreSQL and MySQL PDO drivers and serves Laravel through Apache on Render's port 10000. Do not use `php artisan serve` in production. Do not configure `LOCAL_MYSQL_*` on Render: the cloud service cannot route to a private LAN address such as `192.168.x.x`. Demonstrate physical MySQL while Laravel runs locally, or set up a separately secured private network/VPN before attempting a cloud-to-LAN connection.

## Security and network notes

- Never commit `.env`, `.env.local`, database passwords, Laravel keys, or Supabase secrets. If exposed, rotate them.
- On the Windows database host, allow TCP 3306 only from the development computer or trusted lab subnet. Do not forward that port from the router or expose it publicly.
- Use the narrowest MySQL account grants needed for the lab; do not use `root` from Laravel.
- A cloud-hosted backend normally cannot connect to a private local-network IP. Supabase remains the student-record source for the public deployment.
# Activity_Flores
