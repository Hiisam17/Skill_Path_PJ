# Git Convention — IT Career Roadmap Platform

> Tài liệu này là quy tắc bắt buộc cho cả team trong suốt sprint.
> Lưu file này vào root của repo để mọi người dễ tìm.

---

## 1. Cấu trúc branch

| Branch | Vai trò | Ai dùng |
|---|---|---|
| `main` | Production. Chỉ merge khi demo/release | Lead |
| `develop` | Branch chính của sprint | Tất cả merge vào đây |
| `feature/auth` | Domain Auth | Dev A |
| `feature/roadmap` | Domain Roadmap | Dev B |
| `feature/skill-tree` | Domain Skill Tree | Dev C |
| `feature/progress` | Domain Progress | Dev D |

### Quy tắc bắt buộc

- Mỗi người chỉ làm việc trên branch domain của mình
- Luôn tạo branch từ `develop`, không tạo từ `main`
- Pull develop về trước khi push: `git pull origin develop`
- **Không push thẳng lên `develop` hoặc `main`** — bắt buộc qua PR
- Không sửa file ngoài domain của mình nếu không có thỏa thuận trước
- Không dùng `git push --force` trên branch chung

---

## 2. Commit message

### Định dạng

```
<type>(<scope>): <mô tả ngắn>
```

### Type hợp lệ

| Type | Ý nghĩa |
|---|---|
| `feat` | Thêm tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Cải thiện code, không thêm tính năng |
| `chore` | Config, dependency, setup |
| `docs` | Cập nhật tài liệu, README, comment |
| `test` | Thêm hoặc sửa test |
| `style` | Format code, không ảnh hưởng logic |

### Scope theo domain

| Scope | Domain |
|---|---|
| `auth` | Dev A — login, JWT, guards, AuthContext |
| `roadmap` | Dev B — career path, roadmap selection |
| `skill` | Dev C — skill API, SkillList, D3.js |
| `progress` | Dev D — progress API, ProgressBar, Dashboard |
| `setup` | Cả team — config, prisma, env |
| `types` | Shared DTOs trong types/index.ts |

### Ví dụ đúng

```bash
feat(auth): implement POST /auth/login with JWT
fix(skill): correct orderIndex sorting in SkillModule
chore(setup): add prisma seed script
refactor(progress): extract progress calculation to service
docs(types): add JSDoc to SkillDto interface
```

### Ví dụ sai

```bash
fix bug                          # thiếu type và scope
WIP                              # không commit WIP lên develop
feat(auth): done                 # mô tả quá ngắn
feat(auth): Add Login And JWT    # 1 commit chỉ làm 1 việc
```

---

## 3. Pull Request

### Khi nào tạo PR

- Khi hoàn thành 1 issue — dù lớn hay nhỏ
- Cuối mỗi ngày — kể cả khi chưa xong, tạo **Draft PR**
- Trước khi tích hợp với domain khác

### Title PR

```
[Auth] Implement POST /auth/login + JWT generation
[Skill] Add D3.js skill tree visualization
[Setup] Configure Prisma with Supabase
```

### Checklist trước khi tạo PR

- [ ] Đã pull develop mới nhất và không có conflict
- [ ] Code chạy được ở local
- [ ] Không có `console.log` hay code thừa
- [ ] Commit message đúng format
- [ ] Đã link PR vào issue: ghi `Closes #<số issue>` trong description

### Quy tắc review

| | Quy tắc |
|---|---|
| Reviewer | Ít nhất 1 người approve trước khi merge |
| Thời gian | Review trong vòng 4 tiếng — không để PR chờ qua ngày |
| Merge | Người tạo PR tự merge sau khi được approve |
| Kiểu merge | Dùng **Squash and merge** để giữ develop history sạch |
| Draft PR | Dùng khi muốn feedback sớm — không merge Draft |

---

## 4. Quy trình hằng ngày

### Sáng — trước khi code

```bash
git checkout develop
git pull origin develop
git checkout feature/<domain>
git merge develop
```

### Trong ngày

Commit thường xuyên — mỗi commit là 1 việc nhỏ hoàn chỉnh.
Không gộp nhiều thứ vào 1 commit lớn.

### Cuối ngày — trước 6PM

```bash
git push origin feature/<domain>
# Tạo PR (hoặc Draft PR) vào develop
# Cập nhật issue trên GitHub Projects
```

### Daily standup (15 phút)

3 câu hỏi:
1. Hôm qua làm được gì?
2. Hôm nay làm gì?
3. Có bị block không?

---

## 5. Xử lý conflict

### Các bước

```bash
# Bước 1 — Pull develop mới nhất
git pull origin develop

# Bước 2 — Mở VS Code, resolve conflict
# Chọn Accept Current / Accept Incoming / Accept Both

# Bước 3 — Commit sau khi resolve
git add .
git commit -m "fix(scope): resolve merge conflict with develop"

# Bước 4 — Chạy lại local để đảm bảo code vẫn hoạt động
```

### Nếu conflict ở file domain khác

**Không tự sửa.** Nhắn ngay cho người phụ trách domain đó để cùng giải quyết.

### Phòng tránh conflict từ đầu

- Pull develop về mỗi sáng trước khi bắt đầu code
- Mỗi người chỉ sửa file trong domain của mình
- Báo team trước khi sửa file dùng chung
- Merge vào develop mỗi cuối ngày

---

## 6. File dùng chung — cần báo team trước khi sửa

| File | Quy tắc |
|---|---|
| `types/index.ts` | Ping cả team trên nhóm chat trước khi thêm/sửa interface |
| `prisma/schema.prisma` | Thống nhất trước, 1 người sửa và chạy migrate |
| `package.json` | Báo khi thêm dependency mới — tránh conflict lock file |
| `app.module.ts` | Mỗi người import module của mình — không xóa import của người khác |

---

## 7. Checkpoint quan trọng

| Ngày | Checkpoint |
|---|---|
| Day 1 sáng | Cả team setup cùng nhau — monorepo, Supabase, Prisma, shared types |
| Day 5 EOD | Tất cả API test được qua Postman, FE route cơ bản chạy được |
| Day 10 | Feature freeze — chỉ fix bug, không thêm feature mới |
| Day 14 | Demo |
