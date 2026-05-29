# Testing Strategy

This project follows a product-style test pyramid:

- Unit tests cover domain rules and data transformations without network calls.
- Integration/e2e tests exercise Nest controllers with mocked external dependencies.
- Frontend component tests cover loading, error, empty and interaction states with mocked APIs.
- CI runs backend and frontend tests/builds on pull requests to `main` and `develop`.

## Current Coverage

### Progress

- Roadmap-scoped progress percentage.
- Empty, partial and complete progress states.
- Multi-roadmap progress grouping.
- Idempotent progress update via `userId_roadmapSkillId` upsert path.

### Dashboard

- Loading, error and empty states.
- Active roadmap rendering.
- Market trend data from backend API.

### Skill Tree

- Roadmap node rendering from flow API data.
- Skill node click opens detail drawer.
- Skill and section node visual states.

### Jobs / Market

- Job listing from backend API data.
- Job list error state.
- Market trend aggregation from stored jobs.
- AI JD analysis UI trigger.

### AI JD Analysis

- Groq SDK is mocked in tests; CI never calls a real AI API.
- Required/gap skill IDs are filtered against the Skill table catalog.
- Invalid or hallucinated skill IDs are dropped.

## Known Gaps / TODO

- Adzuna import is not implemented as a dedicated service yet. When added, cover:
  - missing `ADZUNA_APP_ID` / `ADZUNA_APP_KEY`
  - Adzuna success transform
  - duplicate import by `source + externalId`
  - Adzuna failure handling
- Skill dependency persistence is not present in the current Prisma schema. When added, cover prerequisite lock/recommendation rules in a dedicated service.
- Dashboard does not yet implement recommended next skills or complete-skill optimistic updates; add component tests with rollback behavior when those UI actions exist.
- `getUserMultiRoadmapProgress` currently performs per-roadmap count/findMany/count calls. It is correct but can become N+1 at scale; consider a future aggregate/groupBy refactor.
- Full-repo lint currently fails because of pre-existing `any` and React hook lint issues outside this testing scope. CI intentionally runs test/build first.
