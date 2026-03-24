# 📊 Phân Tích Readiness Repository Cho Nhóm 4 Người

**Ngày phân tích**: 23/03/2026  
**Trạng thái hiện tại**: **PARTIALLY READY** ⚠️  
**Đề xuất**: Có thể bắt đầu song song, nhưng cần hoàn thành một số tasks prerequisites

---

## 1️⃣ TÌNH TRẠNG HIỆN TẠI

### ✅ ĐÃ HỌC XONG (Infrastructure Foundation)

#### Backend

- ✅ Monorepo setup (npm workspaces, root tsconfig)
- ✅ NestJS scaffold + app.module cấu hình 6 modules
- ✅ PrismaModule (Global scope, lifecycle hooks)
- ✅ 6 Domain modules generated: auth, users, career-paths, roadmaps, skills, progress
- ✅ Shared types/DTOs (11 interfaces + 1 enum)
- ✅ Prisma schema (5 models đầy đủ với relationships)
- ✅ TypeScript strict mode enabled
- ✅ Dependencies installed: NestJS, Prisma, bcrypt, ts-node
- ✅ seed.ts file created (10 models cần seed)
- ✅ TypeScript compilation: 0 errors

#### Frontend

- ✅ React + Vite scaffold
- ✅ React Router setup (4 routes: 1 public, 3 protected)
- ✅ 10 files scaffold (pages, components, services, context)
- ✅ AuthContext + Provider pattern
- ✅ Axios API service + interceptors
- ✅ ProtectedRoute component
- ✅ Path aliases configured (vite + tsconfig)
- ✅ Dependencies installed: react-router-dom, axios
- ✅ TypeScript compilation: 0 errors

#### Documentation

- ✅ BACKEND_SCAFFOLD.md (300+ lines)
- ✅ README.md (project overview)
- ✅ Root package.json (monorepo config)

---

### ⚠️ INCOMPLETE - BLOCKERS FOR TEAM

#### Backend Implementation Needed

- 🔴 **Controllers**: Chỉ có @Controller decorator, **chưa có route handlers** (@Get, @Post, etc.)
  - AuthController (POST /auth/login)
  - UsersController (POST /users/select-roadmap, GET /users/roadmap)
  - CareerPathsController (GET /career-paths)
  - RoadmapsController (GET /roadmaps/:id)
  - SkillsController (GET /roadmaps/:id/skills)
  - ProgressController (POST /skills/:id/complete, GET /users/progress)

- 🔴 **Services**: Tất cả 12 methods đều là stubs (throw Error('Not implemented'))
  - AuthService: login(), generateToken()
  - UsersService: selectRoadmap(), getSelectedRoadmap()
  - CareerPathsService: findAll()
  - RoadmapsService: findById(), findByCareerPath()
  - SkillsService: findByRoadmap()
  - ProgressService: completeSkill(), getUserProgress()

- 🔴 **Database**: Chưa có migration (blocked on DATABASE_URL)
  - Schema designed ✅, nhưng chưa `prisma migrate dev --name init`
  - Seed data chưa được populate
  - No test data to work with

#### Frontend Implementation Needed

- 🔴 **API Calls**: Tất cả 6 components/pages chứa TODO sections
  - LoginPage: TODO implement login logic
  - CareerPathPage: TODO fetch GET /career-paths
  - RoadmapPage: TODO fetch GET /users/roadmap
  - DashboardPage: TODO fetch GET /users/progress
  - AuthContext: TODO implement login() API call
  - SkillList: TODO fetch GET /roadmaps/:id/skills

- 🔴 **Styling**: Chỉ có plain HTML, không có CSS (no styling applied yet)

#### Integration Blockers

- 🔴 **No end-to-end flow can be tested yet** (backend services + controllers + DB all needed)

---

## 2️⃣ SETUP CHECKLIST TRƯỚC KHI TEAM BẮT ĐẦU

### Phase 0: Database Setup (1-2 hours) — **CRITICAL**

```
Required:
☐ Create Supabase PostgreSQL project (or local PostgreSQL)
☐ Get DATABASE_URL connection string
☐ Update .env file (apps/server/.env)
☐ Run: npx prisma migrate dev --name init
☐ Run: npm run prisma:seed
☐ Verify data in prisma studio: npx prisma studio

Responsible: Tech Lead / 1 person
Blocks: Everything else
```

### Phase 1: Backend Controllers (2-3 hours) — **CRITICAL**

```
Tasks per module (30 min each):
☐ AuthController: @Post('/login') → call authService.login()
☐ UsersController: @Post('/select-roadmap'), @Get('/roadmap')
☐ CareerPathsController: @Get('/') → call careerPathsService.findAll()
☐ RoadmapsController: @Get('/:id')
☐ SkillsController: @Get('/roadmap/:roadmapId/skills')
☐ ProgressController: @Post('/skills/:id/complete'), @Get('/users/progress')

Responsible: 2 backend developers (parallel work)
Prerequisite: Database setup (Phase 0)
Blocks: Frontend can't test API yet
Estimated: 6 tasks × 30min = 3 hours
```

### Phase 2: Backend Service Implementations (6-9 hours) — **CRITICAL**

```
Task per service (45-60 min each):
☐ AuthService.login() — query user, bcrypt.compare, JWT.sign
☐ AuthService.generateToken() — JWT token generation
☐ UsersService: selectRoadmap(), getSelectedRoadmap()
☐ CareerPathsService.findAll() — query all + order
☐ RoadmapsService: findById(), findByCareerPath()
☐ SkillsService.findByRoadmap() — LEFT JOIN with progress
☐ ProgressService: completeSkill(), getUserProgress()

Responsible: 2 backend developers (parallel)
Prerequisite: Database setup, Controllers created
Blocks: Nothing strictly, but frontend can't test
Estimated: 12 methods × 45min = 9 hours (with testing)
```

### Phase 3: Backend Integration Setup (2-3 hours)

```
☐ Add CORS config (allow origin: http://localhost:5173)
☐ Add JWT_SECRET to .env
☐ Setup @nestjs/jwt and @nestjs/passport
☐ Create JwtStrategy for auth guards
☐ Test with Postman/curl before frontend connects

Responsible: 1 backend developer
Prerequisite: Services implemented
Blocks: Frontend integration
```

### Phase 4: Frontend API Integration (2-3 hours)

```
Implementation per page (15-20 min each):
☐ LoginPage: Connect to POST /auth/login
☐ AuthContext: Implement login() method
☐ CareerPathPage: Fetch GET /career-paths
☐ RoadmapPage: Fetch GET /users/roadmap
☐ DashboardPage: Fetch GET /users/progress + handle skill completion
☐ SkillList: Fetch GET /roadmaps/:id/skills

Responsible: 2 frontend developers (parallel)
Prerequisite: Backend controllers + services working
Estimated: 6 tasks × 20min = 2 hours
```

### Phase 5: End-to-End Testing (2-3 hours)

```
Test flow:
☐ Login with test@example.com / password123
☐ Select career path
☐ View skill tree
☐ Mark skill completed
☐ Check progress updated
☐ Logout and verify redirect

Responsible: 1 QA + 1 dev (pair testing)
Prerequisite: All frontend + backend integrated
```

---

## 3️⃣ TASK ALLOCATION FOR 4-PERSON TEAM

### Recommended Team Structure

```
Team Composition:
┌─────────────────────────────────────────────┐
│ dev@team: 2 Backend + 2 Frontend            │
└─────────────────────────────────────────────┘

Timeline: ~2 weeks at 8 hours/day (~40 hours work)
├─ Days 1-2: Database + Controllers (6-7 hours)
├─ Days 3-4: Backend Services (9-10 hours)
├─ Days 5-6: CORS + JWT Setup (3 hours)
├─ Days 7-8: Frontend Integration (2-3 hours)
└─ Days 9-10: Testing + Polish (3-4 hours)
```

### Sprint 1 (Days 1-5): Backend Foundation

```
Developer A (Backend Lead):
  Day 1: Database setup (Supabase or local)
  Day 2: Controllers generation (3 modules)
  Day 3-4: Service implementations (6 methods)
  Day 5: JWT/CORS setup + API documentation

Developer B (Backend):
  Day 1: Review database schema
  Day 2: Controllers generation (3 modules)
  Day 3-4: Service implementations (6 methods)
  Day 5: Unit testing + integration testing
```

### Sprint 2 (Days 6-10): Frontend Integration + QA

```
Developer C (Frontend Lead):
  Day 6: Setup Postman collection from backend
  Day 7: LoginPage + AuthContext impl
  Day 8: CareerPathPage + RoadmapPage impl
  Day 9-10: Testing + CSS styling

Developer D (Frontend):
  Day 6: Review backend API contracts
  Day 7: DashboardPage + SkillList impl
  Day 8: Error handling + loading states
  Day 9-10: E2E testing + bug fixes
```

---

## 4️⃣ PRIORITIZED TASK LIST (By Criticality)

### 🔴 CRITICAL PATH (Must do before team starts feature work)

```
1. [1-2h] Database Setup (Supabase/local)
   └─ Blocker: Nothing else can run without DB

2. [1h] Prisma Migrate + Seed
   └─ Blocker: Team needs test data

3. [3h] Backend Controllers
   └─ Blocker: Frontend can't test API

4. [3h] Service Methods (at least Auth + CareerPaths)
   └─ Blocker: Basic flow won't work

5. [1h] CORS + JWT Setup
   └─ Blocker: FE-BE communication fails
```

### 🟡 HIGH PRIORITY (Needed for demo)

```
6. [3h] Remaining Service Implementations
7. [2h] Frontend API Integration
8. [2h] End-to-end Testing
```

### 🟢 NICE-TO-HAVE (After MVP)

```
9. [4h] Styling/UI Polish
10. [2h] Error boundary + error handling
11. [3h] Unit tests
12. [2h] Documentation polish
```

---

## 5️⃣ DEPENDENCIES & VERSIONS

### Backend

```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/core": "^11.0.1",
  "@nestjs/jwt": "❌ MISSING - Need to install",
  "@nestjs/passport": "❌ MISSING - Need to install",
  "@prisma/client": "^7.5.0",
  "prisma": "^7.5.0",
  "bcrypt": "^6.0.0",
  "passport-jwt": "❌ MISSING - Need to install",
  "ts-node": "^10.9.1"
}
```

**Missing packages to install**:

```bash
npm install @nestjs/jwt @nestjs/passport passport-jwt
npm install --save-dev @types/passport-jwt
```

### Frontend

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "vite": "^5.x"
}
```

✅ All essential packages installed

---

## 6️⃣ CURRENT FILE COUNT & STATS

```
Backend:
├── 6 modules (18 files: 3 per module)
├── 6 services (12 stub methods)
├── 6 controllers (empty stubs)
├── 1 global infrastructure module (PrismaModule)
├── 1 shared types file (11 interfaces + 1 enum)
├── Prisma schema (5 models)
└── Total: ~100+ backend source files

Frontend:
├── 4 pages (login, career-path, roadmap, dashboard)
├── 3 components (ProtectedRoute, SkillList, ProgressBar)
├── 1 context (AuthContext provider)
├── 1 API service (with interceptors)
├── 1 types file (exported from backend)
├── 1 main router (4 routes configured)
└── Total: ~40+ frontend source files

Documentation:
├── BACKEND_SCAFFOLD.md (300+ lines)
├── README.md (project overview)
├── package.json (monorepo + scripts)
└── TEAM_READINESS_ANALYSIS.md (this file)

Database:
├── Prisma schema: ✅ Complete
├── Migrations: ❌ Pending (blocked on DATABASE_URL)
├── Seed script: ✅ Created
├── Seed data: ❌ Not populated
```

---

## 7️⃣ RECOMMENDATION: START STRATEGY

### Option A: Start Immediately (Parallel Work) ⭐ RECOMMENDED

```
Team splits into 2 tracks:
Track A (Backend setup, 2 devs):
  - Days 1-2: Database + Controllers
  - Days 3-4: Services
  - Days 5: CORS/JWT

Track B (Frontend setup, 2 devs):
  - Days 1-2: Review backend architecture
  - Days 1-2: Write setup documentation
  - Days 3-4: Setup Postman collection (mock responses)
  - Days 5-6: Build UI components (without real API)

Day 6: Merge tracks → Frontend connects to real backend
Advantage: Parallel work, 25% faster to MVP
```

### Option B: Sequential Approach

```
Phase 1 (2 devs, Days 1-3): Backend complete
Phase 2 (2 devs, Days 4-6): Frontend integration
Advantage: Simpler coordination, but slower MVP
```

**Khuyên dùng**: **Option A** (parallel) — team có developer experience, cấu trúc đã clear.

---

## 8️⃣ KNOWN ISSUES & GOTCHAS

| Issue              | Impact      | Mitigation                                      |
| ------------------ | ----------- | ----------------------------------------------- |
| No DATABASE_URL    | 🔴 Critical | **Must setup Supabase or local DB first**       |
| Controllers empty  | 🔴 Critical | **Create controllers + routes before testing**  |
| Services are stubs | 🔴 Critical | **Need 6-9h implementation**                    |
| No CORS setup      | 🟡 High     | **Add after services, before FE tests**         |
| No JWT strategy    | 🟡 High     | **Need JwtStrategy for protected routes**       |
| No error handling  | 🟡 High     | **Add try-catch + error responses in services** |
| No validation      | 🟡 High     | **Add @IsEmail(), @MinLength() in DTOs**        |
| CSS not started    | 🟢 Low      | **Can add after MVP works**                     |

---

## 9️⃣ CHECKLIST: READY TO START?

```
✅ Backend structure setup
✅ Frontend structure setup
✅ Shared types defined
✅ Database schema designed
✅ TypeScript compilation passing
✅ Dependencies installed
✅ Root documentation ready

⚠️ Database connection pending (non-blocking if using mocks)
⚠️ Controllers need route decorators
⚠️ Services need implementations
⚠️ Frontend API calls need implementation

VERDICT: 70% READY
├─ Structure: 100% ✅
├─ Types: 100% ✅
├─ Dependencies: 90% (need @nestjs/jwt, @nestjs/passport)
├─ Documentation: 80%
├─ Implementation: 5% (only scaffolds + stubs)
└─ Database: 0% (schema designed, not migrated)
```

---

## 🔟 NEXT STEPS (Do THIS first)

### Immediate Actions (Next 30 minutes):

```
☐ 1. Decide on Database: Supabase vs Local PostgreSQL
☐ 2. Create Supabase project (if Option A)
     OR setup Docker PostgreSQL (if Option B)
☐ 3. Get DATABASE_URL and save it securely
☐ 4. Update .env file with DATABASE_URL
☐ 5. Run: npm install @nestjs/jwt @nestjs/passport passport-jwt
```

### Phase 0 Tasks (2 hours):

```
☐ npx prisma migrate dev --name init
☐ npm run prisma:seed
☐ npx prisma studio (verify data)
☐ Start backend: npm run start:dev (from apps/server)
```

### Phase 1 Kickoff:

```
After Phase 0 completes:
☐ Assign controller tasks (30 min each × 6)
☐ Assign service implementation tasks (45 min each × 12)
☐ Assign frontend component tasks
☐ Setup daily standup (15 min)
```

---

## 📝 CONCLUSION

**Repository Readiness: 70/100** ✅ Good foundation, but needs implementation work

**Recommendation**: ✅ **Team CAN start work TODAY** with proper planning

**Timeline to MVP**: ~2 weeks (if 2 backend + 2 frontend devs working full-time)

**Critical dependency**: 🔴 Database setup (Supabase/local PostgreSQL) — block on this 1 day max

---

**Document created**: 23/03/2026  
**Last updated**: Today  
**Team**: 4 developers (suggested: 2 BE + 2 FE)  
**Next review**: After Phase 1 controllers complete
