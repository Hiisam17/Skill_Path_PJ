## Bài toán 4: Quản lý kỹ năng & Lộ trình học tập (SkillPath)

### 1. Mô tả bài toán
Sinh viên IT không biết nên học gì tiếp theo, học xong một khóa không biết áp dụng vào đâu. Thiếu roadmap rõ ràng cho từng vị trí nghề nghiệp cụ thể trong thị trường Việt Nam.

### 2. Business Model

| Thành phần | Chi tiết |
|---|---|
| **Khách hàng mục tiêu** | Sinh viên IT, người chuyển ngành, junior developer |
| **Giá trị cốt lõi** | Lộ trình rõ ràng, cá nhân hóa, tracking tiến độ |
| **Nguồn thu** | Affiliate link khóa học (Udemy, Coursera...), gói Premium (roadmap nâng cao, mentor), hợp tác doanh nghiệp (đề xuất skill cho tuyển dụng) |
| **Kênh phân phối** | Web app, SEO (roadmap content), cộng đồng dev |
| **Đối tác** | Nền tảng học online, công ty IT tuyển dụng |
| **Chi phí chính** | Server, content curation, AI recommendation, job crawling |

### 3. Chức năng chính

| # | Chức năng | Mô tả |
|---|---|---|
| F1 | Khảo sát ban đầu | Quiz đánh giá level hiện tại + mục tiêu nghề nghiệp |
| F2 | Roadmap cá nhân hóa | Tạo lộ trình học theo role (FE, BE, Mobile, DevOps, Data...) |
| F3 | Skill Tree | Hiển thị dạng cây kỹ năng, unlock theo tiến độ |
| F4 | Resource curation | Gợi ý tài liệu/khóa học miễn phí & trả phí cho từng skill |
| F5 | Progress tracking | Check-in học tập, streak, milestone |
| F6 | Community roadmap | Người dùng tạo & chia sẻ roadmap của riêng mình |
| F7 | Market insight | Thống kê skill đang hot trên thị trường tuyển dụng VN |

### 4. User Journey

```
┌─────────┐   ┌──────────┐   ┌────────────┐   ┌──────────┐
│ Đăng ký │──▶│ Làm quiz │──▶│ Nhận road- │──▶│ Bắt đầu  │
│         │   │ đánh giá │   │ map cá nhân│   │ học      │
└─────────┘   └──────────┘   └────────────┘   └─────┬────┘
                                                     │
     ┌───────────────────────────────────────────────┘
     ▼
┌──────────┐   ┌──────────┐   ┌────────────┐
│ Hoàn     │──▶│ Unlock   │──▶│ Đạt mile-  │
│ thành    │   │ skill    │   │ stone →    │
│ resource │   │ tiếp theo│   │ Certificate│
└──────────┘   └──────────┘   └────────────┘
     │
     ▼
┌──────────────┐
│ Chia sẻ      │
│ roadmap lên  │
│ community    │
└──────────────┘
```

### 5. Architecture Diagram

```
┌──────────────────────────────────┐
│   Frontend (React + D3.js)       │
│   ┌─────────┐ ┌───────────┐     │
│   │Skill    │ │ Dashboard │     │
│   │Tree View│ │ /Progress │     │
│   │(D3.js)  │ │ Charts    │     │
│   └─────────┘ └───────────┘     │
└────────────┬─────────────────────┘
             ▼
      ┌──────────────┐
      │  Backend     │
      │  (NestJS)    │
      ├──────────────┤
      │ User Service │
      │ Roadmap Svc  │──▶ ┌───────────────┐
      │ Recommend Svc│    │ Job Crawler   │
      │ Analytics Svc│    │ (TopDev, ITviec│
      └──────┬───────┘    │  LinkedIn)    │
             │            └───────────────┘
             ▼
   ┌────────────────────┐
   │ PostgreSQL + Redis │
   │ + Elasticsearch    │
   └────────────────────┘
```

### 6. ER Diagram (Core)

```
┌────────────┐    ┌──────────────┐    ┌────────────┐
│   User     │    │   Roadmap    │    │   Role     │
├────────────┤    ├──────────────┤    ├────────────┤
│ id (PK)    │────│ id (PK)      │────│ id (PK)    │
│ email      │    │ user_id (FK) │    │ name       │
│ name       │    │ role_id (FK) │    │ (Frontend, │
│ current_lvl│    │ created_at   │    │  Backend,  │
└────────────┘    │ progress %   │    │  DevOps..) │
                  └──────────────┘    └────────────┘

┌────────────┐    ┌──────────────┐    ┌────────────┐
│   Skill    │    │ RoadmapSkill │    │  Resource  │
├────────────┤    ├──────────────┤    ├────────────┤
│ id (PK)    │────│ roadmap_id   │────│ id (PK)    │
│ name       │    │ skill_id     │    │ skill_id   │
│ category   │    │ order        │    │ title      │
│ description│    │ status       │    │ url        │
│ difficulty │    │ (locked/     │    │ type(video/│
│ parent_id  │    │  learning/   │    │  article/  │
│ (self-ref) │    │  completed)  │    │  course)   │
└────────────┘    │ completed_at │    │ is_free    │
                  └──────────────┘    │ rating     │
                                      └────────────┘

┌──────────────┐
│ MarketTrend  │
├──────────────┤
│ id (PK)      │
│ skill_id(FK) │
│ job_count    │
│ avg_salary   │
│ trend(up/dn) │
│ crawled_at   │
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
