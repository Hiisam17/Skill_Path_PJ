# Team Task Checklist

## Team Git Flow (Recommended)

- [ ] GIT-01: Push baseline scaffold to main once, then lock main for direct pushes (only merge via PR).
- [ ] GIT-02: Every task starts from latest main: git checkout main && git pull origin main.
- [ ] GIT-03: Create task branch with naming: feature/<task-id>-<short-name> (example: feature/fe-01-login-submit).
- [ ] GIT-04: Commit small and focused, suggested format: feat(fe-01): implement login submit flow.
- [ ] GIT-05: Before opening PR, sync branch with main (rebase preferred): git fetch origin && git rebase origin/main.
- [ ] GIT-06: Run quality gate locally before PR: npm run build --workspaces, npm run test --workspaces.
- [ ] GIT-07: Open PR with clear scope (1 task or tightly related tasks), request at least 1 reviewer.
- [ ] GIT-08: Merge with Squash and delete branch after merge to keep history clean.
- [ ] GIT-09: For urgent fixes, use hotfix/<short-name> from main and merge back via PR.
- [ ] GIT-10: Never commit secrets (.env stays local); share required vars via .env.example.

## Sprint 1 - Auth and Base Flow

- [ ] FE-01: Implement login submit flow in [apps/web/src/pages/LoginPage.tsx](apps/web/src/pages/LoginPage.tsx) by calling context login and redirecting to career paths on success.
- [ ] FE-02: Implement auth login logic in [apps/web/src/context/AuthContext.tsx](apps/web/src/context/AuthContext.tsx) using API login response, token storage, and user state update.
- [ ] FE-03: Implement auth restore on app start in [apps/web/src/context/AuthContext.tsx](apps/web/src/context/AuthContext.tsx) to keep session after refresh.
- [ ] FE-04: Implement 401 global handling in [apps/web/src/services/api.ts](apps/web/src/services/api.ts) to clear token and send user back to login.

## Sprint 2 - Roadmap Selection Flow

- [ ] FE-05: Implement career paths fetch in [apps/web/src/pages/CareerPathPage.tsx](apps/web/src/pages/CareerPathPage.tsx) via GET career paths endpoint and render response.
- [ ] FE-06: Implement career path selection submit in [apps/web/src/pages/CareerPathPage.tsx](apps/web/src/pages/CareerPathPage.tsx), persist selected roadmap id, and navigate to roadmap page.
- [ ] FE-07: Implement selected roadmap fetch in [apps/web/src/pages/RoadmapPage.tsx](apps/web/src/pages/RoadmapPage.tsx) and show proper empty/error states.

## Sprint 3 - Dashboard and Skills

- [ ] FE-08: Implement progress fetch in [apps/web/src/pages/DashboardPage.tsx](apps/web/src/pages/DashboardPage.tsx) from users progress endpoint.
- [ ] FE-09: Implement skill list fetch in [apps/web/src/components/SkillList.tsx](apps/web/src/components/SkillList.tsx) for selected roadmap.
- [ ] FE-10: Implement complete skill action in [apps/web/src/pages/DashboardPage.tsx](apps/web/src/pages/DashboardPage.tsx) and refresh both progress and skill list.

## Sprint 4 - Backend API Completion

- [ ] BE-01: Complete login endpoint and service logic in [apps/server/src/auth/auth.controller.ts](apps/server/src/auth/auth.controller.ts) and [apps/server/src/auth/auth.service.ts](apps/server/src/auth/auth.service.ts).
- [ ] BE-02: Complete career path listing in [apps/server/src/career-paths/career-paths.controller.ts](apps/server/src/career-paths/career-paths.controller.ts) and [apps/server/src/career-paths/career-paths.service.ts](apps/server/src/career-paths/career-paths.service.ts).
- [ ] BE-03: Complete roadmap query in [apps/server/src/roadmaps/roadmaps.controller.ts](apps/server/src/roadmaps/roadmaps.controller.ts) and [apps/server/src/roadmaps/roadmaps.service.ts](apps/server/src/roadmaps/roadmaps.service.ts).
- [ ] BE-04: Complete skills list and skill completion flow in [apps/server/src/skills/skills.controller.ts](apps/server/src/skills/skills.controller.ts) and [apps/server/src/skills/skills.service.ts](apps/server/src/skills/skills.service.ts).
- [ ] BE-05: Complete progress summary API in [apps/server/src/progress/progress.controller.ts](apps/server/src/progress/progress.controller.ts) and [apps/server/src/progress/progress.service.ts](apps/server/src/progress/progress.service.ts).

## Sprint 5 - Quality Gate

- [ ] QA-01: Update and pass frontend tests for modified pages/components under [apps/web/src](apps/web/src).
- [ ] QA-02: Update and pass backend unit tests for modified modules under [apps/server/src](apps/server/src).
- [ ] QA-03: Run end-to-end smoke tests in [apps/server/test/app.e2e-spec.ts](apps/server/test/app.e2e-spec.ts) for login, select path, view roadmap, view dashboard, complete skill.
- [ ] QA-04: Run full build checks from [apps/web/package.json](apps/web/package.json) and [apps/server/package.json](apps/server/package.json) before merge.

## Definition of Done

- [ ] All TODO Not implemented placeholders removed from active app flows.
- [ ] No TypeScript or lint errors in frontend and backend.
- [ ] Core journey works: login -> choose career path -> view roadmap -> view skills -> mark skill complete -> progress updates.
- [ ] PR includes test updates and short release note.
