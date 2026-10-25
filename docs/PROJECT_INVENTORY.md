# Danh Mục Thành Phần Dự Án (Project Inventory): DevSpeak AI

Tài liệu này tổng hợp toàn bộ các thành phần, thư mục, công nghệ và tài nguyên thuộc hệ sinh thái DevSpeak AI.

---

## 1. Cấu Trúc Thư Mục Monorepo

```
DEVSPEAK-AI/
├── apps/
│   ├── web/               # Next.js 15, React 19, Tailwind CSS, TypeScript (PWA Studio)
│   └── api/               # FastAPI, Pydantic v2, Python 3.12, SQLAlchemy AsyncIO (REST API)
├── deploy/
│   └── gitops/            # Quản lý phát hành GitOps & Kubernetes
│       ├── charts/        # Helm Charts cho Web và API
│       ├── environments/  # Helm values cho local-kind và gke-portfolio
│       └── scripts/       # Bộ script tự động hóa PowerShell di động
├── infra/
│   └── terraform/         # Hạ tầng dưới dạng mã (IaC) trên Google Cloud Platform
│       ├── modules/       # Các module tái sử dụng: cloud_run, cloud_sql, wif, secret_manager
│       └── environments/  # Cấu hình cụ thể cho staging và prod
├── docs/                  # Toàn bộ hệ thống tài liệu kỹ thuật bằng tiếng Việt
│   ├── DECISIONS/         # Biên bản ghi nhận quyết định kiến trúc (ADRs)
│   ├── ARCHITECTURE.md    # Đặc tả kiến trúc hệ thống
│   ├── COST_ESTIMATE.md   # Kế hoạch FinOps và quản lý ngân sách $300
│   ├── DEFECT_BACKLOG.md  # Danh sách lỗ hổng và nhật ký khắc phục
│   ├── FUNCTIONAL_AUDIT.md# Báo cáo kiểm định 15 chiều tính năng
│   ├── GCP_ARCHITECTURE.md# Kiến trúc đám mây GCP chuyên sâu
│   ├── KNOWN_ISSUES.md    # Danh sách sự cố và giải pháp tạm thời
│   ├── OPERATIONS.md      # Sổ tay vận hành và khởi chạy hệ thống
│   ├── PROJECT_CONTEXT.md # Ngữ cảnh dự án và nguyên tắc kỹ thuật
│   ├── RELEASE_EVIDENCE.md# Bằng chứng kiểm định trực tiếp trên 5 môi trường
│   ├── ROADMAP.md         # Lộ trình phát triển sản phẩm
│   ├── SECURITY.md        # Chính sách an toàn thông tin và bảo vệ bí mật
│   ├── SESSION_HANDOFF.md # Sổ nhật ký bàn giao kỹ thuật & hướng dẫn truy cập
│   ├── TEST_MATRIX.md     # Ma trận kiểm thử toàn diện
│   ├── THREAT_MODEL.md    # Mô hình đe dọa STRIDE
│   ├── USER_GUIDE.md      # Sổ tay hướng dẫn sử dụng dành cho ứng viên
│   └── WORKLOG.md         # Nhật ký công việc kỹ thuật chi tiết
├── docker-compose.yml     # Điều phối ngăn xếp 3 container cục bộ
├── GEMINI.md              # Quy tắc vận hành kỹ thuật và ngữ cảnh cốt lõi
└── README.md              # Tài liệu giới thiệu tổng quan dự án
```

---

## 2. Danh Mục Các Môi Trường Triển Khai (5 Môi Trường)

1. **Track A - Local Docker Compose**: Chạy 3 container (`devspeak-web`, `devspeak-api`, `devspeak-db`) trên máy phát triển, kết nối mạng bridge nội bộ.
2. **Track A - GCP Cloud Run Staging**: Môi trường tiền sản xuất trên đám mây, tự động co giãn về 0 khi nhàn rỗi.
3. **Track A - GCP Cloud Run Production**: Môi trường sản xuất chính thức, kết nối Cloud SQL PostgreSQL 16 và Secret Manager.
4. **Track B - Local Kubernetes (kind)**: Cụm Kubernetes cục bộ mô phỏng môi trường sản xuất, quản lý bằng Helm Chart và NGINX Ingress Controller.
5. **Track B - GCP GKE Autopilot (GitOps)**: Cụm Kubernetes tự động hóa trên đám mây, tích hợp Ingress Load Balancer công khai và bộ điều khiển Argo CD.
