# Fast Food

A fast-food ordering platform with separate customer, admin, and Express API apps.

## Apps

- `server`: Express, MongoDB, JWT auth in secure cookies, CSRF, rate limiting, Helmet, upload protection.
- `client`: customer ordering UI.
- `admin`: admin dashboard.

## Code Organization

- Server startup lives in `server/app.js`, with route registration in `server/routes/*.routes.js`.
- Server config is split into `server/config/` for CORS, route prefixes, and proxy settings.
- Database startup lives in `server/server.js` and `server/database/connect.js`.
- Error handlers live in `server/middlewares/errorHandlers.js`.
- Security middleware is split under `server/middlewares/security/`, with `server/middlewares/security.js` re-exporting the public middleware API.
- Frontend API helpers are split into `env`, `csrf`, retry, and request helper files in each app's `features/services` folder.

## Security

- Access and refresh tokens are stored only in `HttpOnly` server cookies.
- Frontend requests use `credentials: "include"` and send the readable `csrfToken` cookie as `x-csrf-token` for unsafe methods.
- Security-sensitive values must not be placed in `localStorage` or `sessionStorage`.
- The only browser storage currently used is guarded customer UI persistence for guest cart and wishlist state.
- Production startup fails when required secrets or safe CORS settings are missing.
- API responses under the admin/client prefixes use `Cache-Control: no-store`.

## Local Setup

Install dependencies in each app:

```bash
cd server
npm install
cd ../admin
npm install
cd ../client
npm install
```

Create env files from the examples:

```bash
copy server\.env.example server\.env
copy admin\.env.example admin\.env
copy client\.env.example client\.env
```

For local development, set `NODE_ENV=development`, use local `VITE_API_URL` values, and keep `CORS_ORIGIN` limited to your local Vite origins.

## Run Locally

```bash
cd server
npm run dev
```

```bash
cd admin
npm run dev
```

```bash
cd client
npm run dev
```

## Create the First Admin

After configuring `server/.env` with the production `MONGO_URL`, create an
admin from an SSH terminal. The password prompt is hidden and the password is
hashed by the existing Admin model before it is stored.

```bash
cd server
npm run admin:create
```

The command asks for a name, email, password (minimum 12 characters), and role.
Use `super_admin` for the first account. It refuses to overwrite an existing
email.

For non-interactive deployment environments, provide `ADMIN_NAME`,
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_ROLE` through the host's
secret environment settings for the duration of the command. Remove those
temporary values after the account is created.

## Production Checklist

- Deploy the API behind HTTPS.
- Set `NODE_ENV=production`.
- Set exact `CORS_ORIGIN` values for the admin and customer frontend domains.
- Use different long random values for every JWT secret in `server/.env`.
- Set `COOKIE_SAME_SITE=none` for cross-site frontend/API domains, or `lax` for same-site domains.
- Set `TRUST_PROXY=1` when the API is behind one trusted reverse proxy.
- Keep the authentication limiter enabled. It applies only to failed login or
  signup responses; session refresh, logout, and profile checks do not consume
  the login-attempt allowance.
- Run `npm run build` in `admin` and `client`.
- Run `npm run security:audit` in each app before release.
- Confirm `GET /health` returns `{ "status": "ok" }`.
