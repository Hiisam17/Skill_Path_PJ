# 🗺️ Domain Documentation: Roadmap System

Tài liệu này định nghĩa cấu trúc, logic và các yêu cầu kỹ thuật dành cho AI Agent để triển khai mã nguồn trong folder `src/modules/roadmaps`.

## 1. Tổng quan Domain
- **Chủ sở hữu:** Dev B (Theo MVP Sprint Plan).
- **Mục tiêu:** Quản lý danh sách các vai trò (Roles), lộ trình (Roadmaps) hệ thống, các chương (Sections) và kỹ năng (Skills) theo cấu trúc tuyến tính tuyến tính (Linear).
- **Luồng chính MVP:** User xem danh sách Roles → Xem danh sách Roadmaps của Role đó → Chọn Roadmap → Bắt đầu học (tạo record trong `user_roadmaps`).

## 2. Technical Stack & Rules
- **Framework:** NestJS (Modular Monolith).
- **ORM:** Prisma (kết nối Supabase PostgreSQL).
- **Security:** Hầu hết API public, riêng API chọn lộ trình (`POST /user-roadmaps`) và xem tiến độ phải dùng `@UseGuards(JwtAuthGuard)`.
- **Convention:** Bám sát `GIT_CONVENTION.md`, đặt tên biến `camelCase` trong TS, mapping với `snake_case` trong DB Prisma.

## 3. Database Schema Context (Prisma)
Dựa trên schema SQL mới nhất, Agent cần sử dụng các model sau (đã được pull về `schema.prisma`):

```prisma
model roles {
  id       Int        @id @default(autoincrement())
  name     String     @unique // VD: Backend Developer
  roadmaps roadmaps[]
}

model roadmaps {
  id                    Int                @id @default(autoincrement())
  title                 String
  description           String?
  user_id               String?            @db.Uuid // null = System Roadmap
  role_id               Int?
  role                  roles?             @relation(fields: [role_id], references: [id])
  is_published          Boolean            @default(false)
  roadmap_sections      roadmap_sections[]
  user_roadmaps         user_roadmaps[]
}

model roadmap_sections {
  id             Int              @id @default(autoincrement())
  roadmap_id     Int
  roadmap        roadmaps         @relation(fields: [roadmap_id], references: [id])
  title          String           // VD: Internet, Ngôn ngữ lập trình
  sort_order     Int?
  roadmap_skills roadmap_skills[]
}

model roadmap_skills {
  id          Int      @id @default(autoincrement())
  section_id  Int
  skill_id    Int
  step_number Int      // Số thứ tự học tuyến tính
  // relations omitted for brevity
}
