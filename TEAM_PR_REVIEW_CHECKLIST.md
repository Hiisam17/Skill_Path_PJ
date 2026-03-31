# Team PR Review Checklist

Use this checklist when reviewing PRs into develop.

## 1. Scope and Ownership

- [ ] PR focuses on one issue or one tightly related scope
- [ ] Domain ownership is respected (auth/roadmap/skill/progress)
- [ ] No risky cross-domain edits without clear note

## 2. Code Quality

- [ ] Logic is clear and consistent with existing structure
- [ ] No dead code, debug logs, or leftover TODOs
- [ ] Error handling is present for expected failure paths
- [ ] Naming is readable and follows project conventions

## 3. API and Data Safety

- [ ] Endpoint/DTO changes are documented in PR description
- [ ] Breaking changes are explicitly called out
- [ ] Prisma/schema changes are intentional and reviewed carefully
- [ ] No secrets, tokens, or private config are committed

## 4. Test and Validation

- [ ] Build/test evidence is included by author
- [ ] Reviewer can reproduce key flow locally
- [ ] Critical path still works: login -> select path -> roadmap -> skills -> progress

## 5. Merge Readiness

- [ ] PR title is clear and domain-scoped
- [ ] Commits follow convention: type(scope): description
- [ ] At least one approval from another team member
- [ ] Use Squash and merge, then delete source branch

## Quick Decision

- Approve: all critical checks pass
- Request changes: any blocker in correctness, security, or flow
