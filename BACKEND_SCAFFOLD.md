# 🚀 IT Career Roadmap Platform - Backend Scaffold Summary

## Project Overview

**Monorepo**: NestJS + React + Vite  
**Backend Framework**: NestJS with TypeScript (Strict Mode)  
**Database ORM**: Prisma with PostgreSQL  
**Architecture**: Modular design with 6 domain-driven modules + Infrastructure layer

---

## 📁 Final Backend Structure

```
apps/server/
├── src/
│   ├── main.ts                          # NestJS bootstrap
│   ├── app.module.ts                    # Root module (imports all 6 modules + PrismaModule)
│   ├── app.controller.ts
│   ├── app.service.ts
│   │
│   ├── types/
│   │   └── index.ts                     # Shared DTOs for API contract
│   │       ├── enums: UserSkillStatus
│   │       ├── Auth: UserDto, LoginDto, AuthResponseDto
│   │       ├── Career: CareerPathDto, RoadmapDto, SelectRoadmapDto
│   │       ├── Skill: SkillDto, CompleteSkillDto
│   │       └── Progress: ProgressDto, UserSkillProgressDto
│   │
│   ├── prisma/                           # Infrastructure: Database access
│   │   ├── prisma.service.ts            # Wraps PrismaClient with lifecycle hooks
│   │   └── prisma.module.ts             # @Global() module, exports PrismaService
│   │
│   ├── auth/                            # Domain: Authentication
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts              # login(), generateToken()
│   │   ├── auth.controller.ts           # [TODO] POST /auth/login
│   │   └── auth.service.spec.ts
│   │
│   ├── users/                           # Domain: User profiles
│   │   ├── users.module.ts
│   │   ├── users.service.ts             # selectRoadmap(), getSelectedRoadmap()
│   │   ├── users.controller.ts          # [TODO] POST /users/select-roadmap, GET /users/roadmap
│   │   └── users.service.spec.ts
│   │
│   ├── career-paths/                    # Domain: Career path management
│   │   ├── career-paths.module.ts
│   │   ├── career-paths.service.ts      # findAll()
│   │   ├── career-paths.controller.ts   # [TODO] GET /career-paths
│   │   └── career-paths.service.spec.ts
│   │
│   ├── roadmaps/                        # Domain: Learning roadmaps
│   │   ├── roadmaps.module.ts
│   │   ├── roadmaps.service.ts          # findById(), findByCareerPath()
│   │   ├── roadmaps.controller.ts       # [TODO] GET /roadmaps/:id
│   │   └── roadmaps.service.spec.ts
│   │
│   ├── skills/                          # Domain: Skill management
│   │   ├── skills.module.ts
│   │   ├── skills.service.ts            # findByRoadmap()
│   │   ├── skills.controller.ts         # [TODO] GET /roadmaps/:roadmapId/skills
│   │   └── skills.service.spec.ts
│   │
│   └── progress/                        # Domain: Progress tracking
│       ├── progress.module.ts
│       ├── progress.service.ts          # completeSkill(), getUserProgress()
│       ├── progress.controller.ts       # [TODO] POST /skills/:id/complete, GET /users/progress
│       └── progress.service.spec.ts
│
├── prisma/
│   ├── schema.prisma                    # 5 models: User, CareerPath, Roadmap, Skill, UserSkillProgress
│   ├── prisma.config.ts
│   └── migrations/                      # [Pending] First migration blocked on DATABASE_URL
│
├── tsconfig.json                        # TypeScript config (strict mode enabled)
├── nest-cli.json
└── package.json                         # Dependencies installed, Prisma client generated
```

---

## 🔌 API Contract (Endpoints to Implement)

All services have method stubs with comprehensive JSDoc. Controllers need route decorators.

### Authentication

```
POST /auth/login
  Body: { email: string, password: string }
  Response: { token: string, user: { id, email, createdAt } }
  Throws: 404 if email not found, 400 if password invalid
```

### Career Paths

```
GET /career-paths
  Response: [ { id, name, description }, ... ]
  Auth Required: No
```

### Roadmap Selection

```
POST /users/select-roadmap
  Body: { careerPathId: string }
  Response: void (204)
  Auth Required: Yes (JWT token)

GET /users/roadmap
  Response: { id, careerPathId, level }
  Auth Required: Yes (JWT token)
```

### Skills

```
GET /roadmaps/:roadmapId/skills
  Response: [ { id, roadmapId, name, description, orderIndex, status: "NOT_STARTED"|"IN_PROGRESS"|"COMPLETED" }, ... ]
  Auth Required: Yes (JWT token)
```

### Progress

```
POST /skills/:skillId/complete
  Response: { id, userId, skillId, status, completedAt }
  Auth Required: Yes (JWT token)

GET /users/progress
  Response: { completedSkills: number, totalSkills: number, percentage: number }
  Auth Required: Yes (JWT token)
```

---

## 📋 Service Methods (All have JSDoc with TODO sections)

### AuthService

| Method            | Parameters | Returns           | Status  |
| ----------------- | ---------- | ----------------- | ------- |
| `login()`         | `LoginDto` | `AuthResponseDto` | 🔴 TODO |
| `generateToken()` | `UserDto`  | `string`          | 🔴 TODO |

### UsersService

| Method                 | Parameters                 | Returns              | Status  |
| ---------------------- | -------------------------- | -------------------- | ------- |
| `selectRoadmap()`      | `userId, SelectRoadmapDto` | `void`               | 🔴 TODO |
| `getSelectedRoadmap()` | `userId`                   | `RoadmapDto \| null` | 🔴 TODO |

### CareerPathsService

| Method      | Parameters | Returns           | Status  |
| ----------- | ---------- | ----------------- | ------- |
| `findAll()` | -          | `CareerPathDto[]` | 🔴 TODO |

### RoadmapsService

| Method               | Parameters     | Returns        | Status  |
| -------------------- | -------------- | -------------- | ------- |
| `findById()`         | `roadmapId`    | `RoadmapDto`   | 🔴 TODO |
| `findByCareerPath()` | `careerPathId` | `RoadmapDto[]` | 🔴 TODO |

### SkillsService

| Method            | Parameters          | Returns      | Status  |
| ----------------- | ------------------- | ------------ | ------- |
| `findByRoadmap()` | `roadmapId, userId` | `SkillDto[]` | 🔴 TODO |

### ProgressService

| Method              | Parameters        | Returns                | Status  |
| ------------------- | ----------------- | ---------------------- | ------- |
| `completeSkill()`   | `userId, skillId` | `UserSkillProgressDto` | 🔴 TODO |
| `getUserProgress()` | `userId`          | `ProgressDto`          | 🔴 TODO |

---

## 🗄️ Database Schema (Prisma 5 Models)

```prisma
// 1. Users — Authentication & profile
model User {
  id    String   @id @default(uuid()) @db.Uuid
  email String   @unique
  passwordHash String
  createdAt DateTime @default(now())
  userSkillProgress UserSkillProgress[]
}

// 2. Career Paths — Career tracks (Backend, Frontend, etc.)
model CareerPath {
  id    String   @id @default(uuid()) @db.Uuid
  name  String
  description String
  roadmaps Roadmap[]
}

// 3. Roadmaps — Learning paths at different levels
model Roadmap {
  id    String   @id @default(uuid()) @db.Uuid
  careerPathId String @db.Uuid
  level String   // "beginner", "intermediate", "advanced"
  careerPath CareerPath @relation(fields: [careerPathId], references: [id], onDelete: Cascade)
  skills Skill[]
}

// 4. Skills — Individual learnable skills
model Skill {
  id    String   @id @default(uuid()) @db.Uuid
  roadmapId String @db.Uuid
  name  String
  description String
  orderIndex Int   // Order within roadmap
  roadmap Roadmap @relation(fields: [roadmapId], references: [id], onDelete: Cascade)
  userProgresses UserSkillProgress[]
}

// 5. User Skill Progress — Completion tracking
model UserSkillProgress {
  id String @id @default(uuid()) @db.Uuid
  userId String @db.Uuid
  skillId String @db.Uuid
  status UserSkillStatus @default(NOT_STARTED)
  completedAt DateTime?
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  skill Skill @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@unique([userId, skillId])  // Prevent duplicate progress records
  @@map("user_skill_progress")
}

enum UserSkillStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}
```

---

## ✅ Completed Setup

- ✅ **Type Safety**: TypeScript strict mode + Prisma generated types
- ✅ **Structure**: 6 modular domains + Infrastructure layer (PrismaModule)
- ✅ **DTOs**: Shared interfaces for API contract (types/index.ts)
- ✅ **Service Layer**: All methods stubbed with comprehensive JSDoc + TODO hints
- ✅ **Database**: Prisma schema complete with 5 models and relationships
- ✅ **Configuration**: tsconfig.json, nest-cli.json, package.json ready
- ✅ **Compilation**: TypeScript compiles without errors

---

## 🔴 Pending Implementation Tasks

### Phase 1: Service Methods (Week 1)

1. **AuthService**
   - [ ] `login()` - Validate email/password, hash verification, JWT generation
   - [ ] `generateToken()` - Sign JWT with user payload and expiry

2. **UsersService**
   - [ ] `selectRoadmap()` - Associate user with roadmap
   - [ ] `getSelectedRoadmap()` - Retrieve user's current roadmap

3. **CareerPathsService**
   - [ ] `findAll()` - Query all career paths from DB

4. **RoadmapsService**
   - [ ] `findById()` - Fetch roadmap by ID
   - [ ] `findByCareerPath()` - Query roadmaps for career path

5. **SkillsService**
   - [ ] `findByRoadmap()` - Join with UserSkillProgress for status

6. **ProgressService**
   - [ ] `completeSkill()` - Upsert UserSkillProgress record
   - [ ] `getUserProgress()` - Calculate progress percentage

### Phase 2: Controllers (Week 1)

- [ ] Add `@Post()`, `@Get()` route decorators
- [ ] Extract request/response bodies
- [ ] Add `@UseGuards(JwtAuthGuard)` for protected routes

### Phase 3: Authentication (Week 1)

- [ ] Install `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`
- [ ] Create `JwtStrategy` (Passport strategy)
- [ ] Create `JwtAuthGuard` (protection decorator)
- [ ] Configure JWT config module with environment variables

### Phase 4: Database Setup (Blocked)

- [ ] Set DATABASE_URL in .env (awaiting Supabase project creation)
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Run seed script with test data

### Phase 5: Testing (Week 2)

- [ ] Unit tests for services
- [ ] Integration tests with database
- [ ] E2E tests with Postman/REST Client

---

## 🛠️ Quick Start for Implementation

Each service method has TODO comments with implementation steps. Example pattern:

```typescript
// From AuthService.login()
async login(loginDto: LoginDto): Promise<AuthResponseDto> {
  // TODO: Implement authentication logic
  // 1. Find user by email in database
  // 2. Verify password using bcrypt.compare()
  // 3. Generate JWT token with user id and email
  // 4. Return token and user information
  throw new Error('Not implemented');
}
```

**To implement**: Replace TODO sections with actual Prisma queries and business logic.

---

## 📦 Dependencies Installed

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@prisma/client": "^7.5.0",
    "prisma": "^7.5.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.1",
    "typescript": "^5.7.3",
    "@types/node": "^22.10.7"
    // ... testing framework deps
  }
}
```

**To install for Auth**:

```bash
npm install @nestjs/jwt @nestjs/passport passport-jwt bcrypt
npm install -D @types/bcrypt
```

---

## 🚀 Next Steps

1. **Set Database URL**: Create Supabase PostgreSQL project and add to .env
2. **Run Migration**: `npx prisma migrate dev --name init`
3. **Implement Services**: Follow TODO hints in each service file (all 12 methods)
4. **Add Controllers**: Route decorators for 6 modules
5. **Setup Auth**: JWT strategy, guards, bcrypt integration
6. **Test E2E**: Postman collection with full flow

---

## 📚 File References

- Service implementations: `src/{auth,users,career-paths,roadmaps,skills,progress}/`
- Shared DTOs: `src/types/index.ts`
- Database wrapper: `src/prisma/prisma.service.ts`
- Schema: `prisma/schema.prisma`
- Config: `tsconfig.json`, `nest-cli.json`

---

**Status**: ✅ Foundation Phase Complete | 🔴 Implementation Phase Ready

Generated: 2026-03-23 | Framework: NestJS 11 | Language: TypeScript 5.7 (Strict)
