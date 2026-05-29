# CI/CD Guide

## Branch Workflow

Use this flow for regular development:

```text
feature/* -> develop -> main
```

Open pull requests from feature branches into `develop`. Promote `develop` to `main` after review and verification.

## CI Behavior

GitHub Actions workflow: `.github/workflows/ci.yml`

Package manager: npm workspaces with a root `package-lock.json`.

The `CI` workflow runs on:

- Pull requests into `develop` and `main`
- Pushes to `develop` and `main`

The workflow has two independent jobs:

- `Backend CI`: installs dependencies, runs `npx prisma generate`, runs Jest tests, builds the NestJS app.
- `Frontend CI`: installs dependencies, runs Vitest tests, builds the Vite app.

Pull request CI does not run production migrations and does not call external APIs such as Adzuna.

## Required GitHub Secrets And Variables

Configure these in GitHub:

```text
Settings -> Secrets and variables -> Actions
```

Required for backend CI:

- `DATABASE_URL`: Supabase PostgreSQL connection string used by `prisma generate`.

Required for production backend deployment:

- `DATABASE_URL`
- `JWT_SECRET`
- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`
- `ADZUNA_COUNTRY`
- `GROQ_API_KEY` or whichever AI provider key the deployment uses.

Required for frontend deployment:

- `VITE_API_URL`: public backend API URL, for example `https://your-backend-url/api`.

For GitHub Actions frontend build, `VITE_API_URL` can be configured as an Actions variable. The CI workflow falls back to `http://localhost:3000/api` for test/build only.

## Frontend Deployment With Vercel

Recommended setup:

- Import the GitHub repository into Vercel.
- Root Directory: `apps/web`
- Framework Preset: `Vite`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variables:

```text
VITE_API_URL=https://your-backend-url/api
```

Do not put backend-only secrets in Vercel frontend environment variables.

## Backend Deployment With Render, Fly.io, Or Web Service Hosting

Recommended web service setup:

- Root Directory: `apps/server`
- Build Command:

```bash
npm ci
npx prisma generate
npm run build
```

- Start Command:

```bash
npm run start:prod
```

The backend already reads `process.env.PORT` and falls back to `3000`, so it is compatible with platforms that inject a port.

Health check endpoint:

```text
GET /health
```

Expected response:

```json
{
  "status": "ok"
}
```

## Prisma Deployment Note

Pull request CI runs only:

```bash
npx prisma generate
```

Do not run this in PR CI:

```bash
prisma migrate deploy
```

Run production migrations only in the official deployment environment after the team agrees on the release process and rollback plan.

## Branch Protection Recommendation

For `main`:

- Require pull request before merging.
- Require at least 1 approval.
- Require status checks to pass.
- Require branches to be up to date before merging.
- Require conversation resolution.
- Block direct pushes.

For `develop`:

- Require pull request before merging.
- Require status checks to pass.
- Block direct pushes.

Required status checks:

- `Backend CI`
- `Frontend CI`

## Manual CI Test

To verify the workflow:

1. Push a branch such as `feature/setup-ci-cd`.
2. Open a pull request into `develop`.
3. Open the GitHub `Actions` tab.
4. Confirm `Backend CI` and `Frontend CI` both pass.
