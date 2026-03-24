# Team Kanban Assignment (Daily Use)

## Suggested Owners

- FE-Owner-1: Auth + Routing
- FE-Owner-2: Dashboard + Skills
- BE-Owner-1: Auth + Users
- BE-Owner-2: Career Paths + Roadmaps + Skills + Progress
- QA-Owner-1: Integration + E2E + Build gate

## Backlog

- [ ] FE-01 - Login submit flow (Login page)
- [ ] FE-02 - Auth login logic (context)
- [ ] FE-03 - Auth restore on app start
- [ ] FE-04 - Global 401 handling
- [ ] FE-05 - Fetch career paths
- [ ] FE-06 - Select career path + navigate
- [ ] FE-07 - Fetch selected roadmap
- [ ] FE-08 - Fetch progress for dashboard
- [ ] FE-09 - Fetch skills for roadmap
- [ ] FE-10 - Complete skill + refresh
- [ ] BE-01 - Login endpoint and service
- [ ] BE-02 - Career paths API
- [ ] BE-03 - Roadmap API
- [ ] BE-04 - Skills list + complete skill API
- [ ] BE-05 - Progress summary API
- [ ] QA-01 - Frontend test updates and pass
- [ ] QA-02 - Backend unit test updates and pass
- [ ] QA-03 - E2E smoke flow pass
- [ ] QA-04 - Full build checks pass

## In Progress

- [ ] FE-Owner-1 -> FE-01
- [ ] FE-Owner-1 -> FE-02
- [ ] FE-Owner-2 -> FE-08
- [ ] FE-Owner-2 -> FE-09
- [ ] BE-Owner-1 -> BE-01
- [ ] BE-Owner-2 -> BE-02
- [ ] BE-Owner-2 -> BE-03
- [ ] QA-Owner-1 -> QA-04

## Review

- [ ] Move completed tasks here for PR review with PR link

## Done

- [ ] Move reviewed tasks here after merge

## Daily Standup Template

- Yesterday: <task IDs done>
- Today: <task IDs in progress>
- Blockers: <endpoint missing / schema mismatch / env issue>

## WIP Rules

- Max 2 tasks per owner in "In Progress"
- FE-01 and BE-01 are highest priority to unblock full flow
- FE-10 only starts after BE-04 and FE-09 are done

## Links

- Detailed checklist: [TEAM_TASK_CHECKLIST.md](TEAM_TASK_CHECKLIST.md)
- Frontend app root: [apps/web/src](apps/web/src)
- Backend app root: [apps/server/src](apps/server/src)
