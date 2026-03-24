# IT Career Roadmap Platform

A monorepo project featuring a NestJS backend and React + Vite frontend.

## Project Structure

```
├── apps/
│   ├── server/     # NestJS backend API
│   └── web/        # React + Vite frontend
├── package.json    # Monorepo workspace configuration
└── tsconfig.json   # Shared TypeScript configuration
```

## Technology Stack

- **Backend**: NestJS, TypeScript
- **Frontend**: React, Vite, TypeScript
- **Package Manager**: npm workspaces

## Getting Started

(Instructions to be added)

## Development

(Instructions to be added)

```

### 5. Architecture Diagram

```

┌──────────────────────────────────┐
│ Frontend (React + D3.js) │
│ ┌─────────┐ ┌───────────┐ │
│ │Skill │ │ Dashboard │ │
│ │Tree View│ │ /Progress │ │
│ │(D3.js) │ │ Charts │ │
│ └─────────┘ └───────────┘ │
└────────────┬─────────────────────┘
▼
┌──────────────┐
│ Backend │
│ (NestJS) │
├──────────────┤
│ User Service │
│ Roadmap Svc │──▶ ┌───────────────┐
│ Recommend Svc│ │ Job Crawler │
│ Analytics Svc│ │ (TopDev, ITviec│
└──────┬───────┘ │ LinkedIn) │
│ └───────────────┘
▼
┌────────────────────┐
│ PostgreSQL + Redis │
│ + Elasticsearch │
└────────────────────┘

```

### 6. ER Diagram (Core)

```

┌────────────┐ ┌──────────────┐ ┌────────────┐
│ User │ │ Roadmap │ │ Role │
├────────────┤ ├──────────────┤ ├────────────┤
│ id (PK) │────│ id (PK) │────│ id (PK) │
│ email │ │ user_id (FK) │ │ name │
│ name │ │ role_id (FK) │ │ (Frontend, │
│ current_lvl│ │ created_at │ │ Backend, │
└────────────┘ │ progress % │ │ DevOps..) │
└──────────────┘ └────────────┘

┌────────────┐ ┌──────────────┐ ┌────────────┐
│ Skill │ │ RoadmapSkill │ │ Resource │
├────────────┤ ├──────────────┤ ├────────────┤
│ id (PK) │────│ roadmap_id │────│ id (PK) │
│ name │ │ skill_id │ │ skill_id │
│ category │ │ order │ │ title │
│ description│ │ status │ │ url │
│ difficulty │ │ (locked/ │ │ type(video/│
│ parent_id │ │ learning/ │ │ article/ │
│ (self-ref) │ │ completed) │ │ course) │
└────────────┘ │ completed_at │ │ is_free │
└──────────────┘ │ rating │
└────────────┘

┌──────────────┐
│ MarketTrend │
├──────────────┤
│ id (PK) │
│ skill_id(FK) │
│ job_count │
│ avg_salary │
│ trend(up/dn) │
│ crawled_at │
└──────────────┘

```

### 7. Skill Tree Visualization (concept)

```

                    ┌──────────┐
                    │ Frontend │
                    │Developer │
                    └────┬─────┘
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        ┌─────────┐┌─────────┐┌─────────┐
        │  HTML   ││   CSS   ││   JS    │
        │ ██████  ││ ██████  ││ █████░  │
        │ 100%    ││ 100%    ││  85%    │
        └────┬────┘└────┬────┘└────┬────┘
             │          │          │
             ▼          ▼          ▼
        ┌─────────┐┌─────────┐┌─────────┐
        │ React   ││Tailwind ││ TypeSc  │
        │ ████░░  ││ ███░░░  ││ ██░░░░  │
        │  65%    ││  50%    ││  30%    │
        └────┬────┘└─────────┘└─────────┘
             │
             ▼
        ┌─────────┐
        │ Next.js │  🔒 Locked
        │ ░░░░░░  │  (cần React > 80%)
        │  0%     │
        └─────────┘

```

```
