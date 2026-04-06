# AI Handoff - Supabase Sync (Backend + Frontend)

## 1) Muc tieu nghiep vu
Du an la he thong hoc tap theo lo trinh nghe nghiep IT:
- Career Path -> Roadmap -> Skills.
- User co tien do hoc (NOT_STARTED / IN_PROGRESS / COMPLETED).
- Frontend can hien thi skill tree va tien do tu du lieu that trong Supabase (khong dung mock).

Muc tieu hien tai:
- Dong bo schema Prisma voi DB Supabase thanh cong.
- Seed du lieu demo thanh cong.
- Backend API tra du lieu that.
- Frontend doc API va render dung du lieu.

## 2) Tech stack va cau truc
- Monorepo TypeScript.
- Backend: NestJS + Prisma 7 + PostgreSQL (Supabase).
- Frontend: React + Vite.
- Workspace chinh:
  - apps/server
  - apps/web

## 3) Domain model hien tai (Prisma moi)
Schema da chuyen sang huong Supabase/profile-centric:
- Profile (user_id UUID)
- CareerPath (careers)
- Roadmap
- RoadmapSection
- RoadmapSkill (co step_number)
- Skill
- ProgressStatus (bang danh muc trang thai)
- UserSkillProgress
- UserRoadmap
- va cac bang resource/reward khac

Luu y quan trong:
- IDs da doi tu UUID cu sang Int cho nhieu bang roadmap/skills.
- API layer dang map Int -> string de giu contract voi frontend.

## 4) Nhung gi da lam xong
Backend:
- Da bat global prefix va CORS trong apps/server/src/main.ts.
- Da implement cac endpoint can cho frontend:
  - GET /api/career-paths
  - GET /api/roadmaps
  - GET /api/roadmaps/:roadmapId
  - GET /api/roadmaps/career-path/:careerPathId
  - GET /api/roadmaps/:roadmapId/skills
  - POST /api/skills/:skillId/complete
  - GET /api/users/progress
- Da refactor service de doc schema moi (RoadmapSection/RoadmapSkill/ProgressStatus...).
- Da viet lai seed theo schema moi, co xu ly upsert va dong bo sequence id.

Frontend:
- Component SkillTree da duoc doi sang goi API thuc te (roadmaps + skills), khong con mock data co dinh.

Build:
- Build backend/frontend da tung pass sau khi refactor schema mismatch.

## 5) Van de con ton dong (blocker chinh)
Blocker runtime khong phai compile:
- DB schema tren Supabase chua sync day du voi schema.prisma moi.
- Dau hieu ro rang: seed fail voi loi thieu cot roadmap_skills.step_number (Prisma P2022).
- Truoc do tung gap loi unique tren ProgressStatus.id (sequence drift) -> da them sequence sync trong seed.

Ket luan:
- Can push schema thanh cong len Supabase truoc, roi moi seed duoc.

## 6) Tinh trang API/frontend hien tai
- Frontend dang ky vong backend endpoint /api/*.
- Khi DB chua sync + seed chua xong thi frontend co the hien fallback/error.
- Sau khi DB sync + seed pass, frontend se co data that de render skill tree.

## 7) Runbook de AI tiep theo xu ly ngay
Lam trong thu muc apps/server.

B1. Xac nhan env:
- DATABASE_URL la postgresql://... (pooler 6543), co sslmode=require va pgbouncer=true.
- DIRECT_URL la postgresql://... (direct 5432), co sslmode=require.
- Co DEMO_USER_ID hop le (UUID).
- KHONG commit secret that vao repository.

B2. Validate schema:
- npm run prisma:validate

B3. Push schema len Supabase:
- npm run prisma:push
- Neu can chap nhan thay doi pha vo du lieu:
  - npx prisma db push --accept-data-loss --schema prisma/schema.prisma

B4. Seed:
- npm run prisma:seed

B5. Chay backend:
- npm run start:dev

B6. Smoke test API:
- GET http://localhost:3000/api/roadmaps
- GET http://localhost:3000/api/roadmaps/{roadmapId}/skills
- GET http://localhost:3000/api/users/progress
- POST http://localhost:3000/api/skills/{skillId}/complete

B7. Chay frontend:
- vao apps/web, npm run dev
- mo UI va xac nhan skill tree hien data tu API.

## 8) File can uu tien doc truoc
Backend:
- apps/server/prisma/schema.prisma
- apps/server/prisma/seed.ts
- apps/server/src/main.ts
- apps/server/src/roadmaps/roadmaps.service.ts
- apps/server/src/skills/skills.service.ts
- apps/server/src/progress/progress.service.ts
- apps/server/src/users/users.controller.ts

Frontend:
- apps/web/src/components/SkillTree.tsx
- apps/web/src/services/* (neu can xac nhan base URL)

## 9) Cac nguy co de y
- Schema drift voi DB Supabase la nguyen nhan chinh, khong phai loi TypeScript.
- De phong pooler timeout khi db push (co the can retry va doi lau hon).
- Tranh sua vo to chuc API contract hien tai vi frontend dang map theo contract do.

## 10) Prompt san cho AI tiep theo (copy-paste)
Ban dang tiep quan du an NestJS + Prisma + React Vite. Muc tieu: hoan tat dong bo Supabase de frontend doc du lieu that.

Yeu cau bat buoc:
1. Khong doi domain/schema logic da migrate, chi fix den muc run duoc end-to-end.
2. Uu tien giai quyet blocker schema drift Supabase (db push) truoc.
3. Sau khi push schema thanh cong, chay seed va xac nhan khong con loi P2022/P2002.
4. Chay backend va smoke test cac API /api/roadmaps, /api/roadmaps/:id/skills, /api/users/progress, /api/skills/:id/complete.
5. Xac nhan frontend apps/web render duoc data that.
6. Neu gap loi moi, phan tich root cause ngan gon + sua truc tiep trong code.
7. Bao cao ket qua theo format:
   - Da lam gi
   - Ket qua test
   - Van de con lai (neu co)
   - File da sua

Bat dau bang viec doc:
- apps/server/prisma/schema.prisma
- apps/server/prisma/seed.ts
- apps/server/src/progress/progress.service.ts
- apps/web/src/components/SkillTree.tsx

Sau do chay runbook va fix den khi thong.
