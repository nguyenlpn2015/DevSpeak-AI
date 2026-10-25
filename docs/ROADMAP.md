# Lộ Trình Phát Triển Sản Phẩm (Product Roadmap): DevSpeak AI

Tài liệu này xác định các cột mốc kỹ thuật của DevSpeak AI từ giai đoạn kiến tạo nền tảng đến khi trở thành một giải pháp phần mềm hoàn chỉnh và một hệ thống chuẩn mực DevSecOps / Cloud Platform trên Google Cloud Platform.

---

## 🏁 Cột Mốc 0: Khởi Tạo Nền Tảng & Rà Soát Môi Trường (Milestone 0)
- **Mục tiêu**: Rà soát hệ thống, thiết lập tiêu chuẩn kiến trúc Monorepo, xây dựng hệ thống tài liệu sống và quản lý bảo mật Git.
- **Trạng thái**: 🟢 **HOÀN THÀNH (COMPLETED)**
- **Kết quả đạt được**:
  - [x] Thiết lập cấu trúc Monorepo chuẩn mực (`apps/web`, `apps/api`, `deploy/gitops`, `infra/terraform`, `docs/`).
  - [x] Quy chuẩn bảo mật `.gitignore` loại trừ hoàn toàn các file bí mật (`.env*`, `*.db`, credentials).
  - [x] Xây dựng bộ tài liệu kỹ thuật toàn diện bằng tiếng Việt và ghi nhận quyết định kiến trúc ADR-0001.

---

## 🚀 Cột Mốc 1: Ứng Dụng Khả Dụng Cốt Lõi (Milestone 1 MVP)
- **Mục tiêu**: Xây dựng ứng dụng web hoạt động hoàn chỉnh từ đầu đến cuối, cho phép kỹ sư IT luyện phỏng vấn và nhận đánh giá từ AI.
- **Trạng thái**: 🟢 **HOÀN THÀNH (COMPLETED)**
- **Kết quả đạt được**:
  - [x] **Backend API FastAPI**: Hỗ trợ đầy đủ endpoint `/healthz`, `/readyz`, quản lý câu hỏi `/api/v1/questions` và phiên làm việc `/api/v1/interviews/sessions`.
  - [x] **Ngân Hàng 26 Câu Hỏi Chuẩn IT/DevOps**: Bao quát Kubernetes, CI/CD, Linux SRE, AWS Cloud, Docker và hành vi STAR.
  - [x] **Cơ Chế Đánh Giá Kép (Dual AI Provider)**:
    - *Deterministic Mock*: Chạy ngoại tuyến, chi phí 0đ, đánh giá dựa trên từ khóa, cấu trúc STAR và số lượng từ.
    - *Google Gemini 2.0 Flash*: Đánh giá AI tạo sinh với Schema JSON nguyên bản và cô lập thẻ XML chống Prompt Injection.
  - [x] **Lưu Trữ Dữ Liệu Bền Vững**: Tích hợp SQLAlchemy 2.0 AsyncIO và cơ chế quản lý migration Alembic.
  - [x] **Giao Diện Frontend Next.js 15**: Tích hợp LinguaFlow Dark-Neon, bộ chuyển đổi ngôn ngữ song ngữ Anh - Việt, chế độ nhập liệu bằng giọng nói (Web Speech API).

---

## 🛡️ Cột Mốc 2: Tự Động Hóa CI/CD & Đóng Gói Container (Milestone 2)
- **Mục tiêu**: Xây dựng quy trình tích hợp liên tục (CI), kiểm soát chất lượng tự động, rà soát bảo mật DevSecOps và đóng gói container.
- **Trạng thái**: 🟢 **HOÀN THÀNH (COMPLETED)**
- **Kết quả đạt được**:
  - [x] Pipeline GitHub Actions kiểm định chất lượng: Linting (`ruff`, `eslint`), kiểm tra kiểu (`tsc`), kiểm thử tự động (`pytest` 70 bài, `vitest` 58 bài).
  - [x] Quét bảo mật tự động: SAST (`bandit` 0 lỗi), kiểm tra thư viện (`pip-audit`, `npm audit`), quét rò rỉ bí mật (`gitleaks`).
  - [x] Đóng gói Docker đa tầng (Multi-stage build) chạy dưới tài khoản non-root (`appuser:10001`, `nextjs:1001`).
  - [x] Điều phối ngăn xếp hoàn chỉnh bằng Docker Compose (Web: 3001, API: 8000, DB: 5432).

---

## ☁️ Cột Mốc 3: Hạ Tầng Đám Mây GCP & Serverless (Milestone 3 — Track A)
- **Mục tiêu**: Triển khai kiến trúc Serverless trên Google Cloud Platform với Cloud Run và Cloud SQL, quản lý bằng Terraform.
- **Trạng thái**: 🟢 **HOÀN THÀNH (COMPLETED)**
- **Kết quả đạt được**:
  - [x] Khởi tạo hạ tầng bằng Terraform cho môi trường Staging và Production.
  - [x] Xác thực Keyless qua Workload Identity Federation (WIF) chỉ gắn với nhánh `main`.
  - [x] Tách biệt tác vụ Database Migration (Cloud Run Job chạy `--wait` trước khi triển khai dịch vụ Web/API).
  - [x] Cloud SQL PostgreSQL 16 cấu hình sao lưu tự động và phục hồi theo thời gian (PITR 7 ngày).
  - [x] Kiểm định thực tế 2 môi trường trực tiếp: Cloud Run Staging và Cloud Run Production.

---

## ☸️ Cột Mốc 4: Nền Tảng Kubernetes & Vận Hành GitOps (Milestone 4 — Track B)
- **Mục tiêu**: Đóng gói ứng dụng dạng Helm Chart, triển khai trên cụm Kubernetes cục bộ (kind) và đám mây (GKE Autopilot) qua Argo CD.
- **Trạng thái**: 🟢 **HOÀN THÀNH (COMPLETED)**
- **Kết quả đạt được**:
  - [x] Helm Chart tham số hóa hoàn chỉnh cho Web và API với khả năng tự động tiêm cấu hình API qua ConfigMap.
  - [x] Triển khai và xác thực Cụm Kubernetes cục bộ (`kind`) với NGINX Ingress Controller.
  - [x] Triển khai Cụm GKE Autopilot (`devspeak-gke-portfolio`) tại Singapore (`asia-southeast1`).
  - [x] Cấu hình Argo CD đồng bộ tự động khai báo GitOps từ repository.
  - [x] Khắc phục triệt để lỗi tiền tố `/api/v1` và cập nhật bản vá v1.0.2-candidate lên kind Revision 2.

---

## 🎯 Cột Mốc 5: Hoàn Thiện Dự Án & Sẵn Sàng Công Bố Public (Milestone 5)
- **Mục tiêu**: Nghiệm thu toàn diện 5 môi trường, củng cố tính sẵn sàng cao (HA), bảo vệ ngân sách FinOps và hoàn tất tài liệu bàn giao.
- **Trạng thái**: 🟡 **GIAI ĐOẠN NGHIỆM THU CUỐI CÙNG (FINAL REVIEW)**
- **Hạng mục thực hiện**:
  - [x] Xác thực trực tiếp 5 môi trường (Compose, kind, Cloud Run Staging, Cloud Run Prod, GKE Autopilot).
  - [x] Củng cố bảo mật WIF Production chỉ cho phép nhánh `main`.
  - [x] Toàn bộ tài liệu kỹ thuật được chuyển ngữ sang tiếng Việt.
  - [x] Rà soát 100% bí mật và khóa truy cập (0 commit/push lên GitHub).
  - [ ] Đồng bộ bản vá Web v1.0.2 lên Cloud Run và GKE (khi có phê duyệt đóng gói release).
  - [ ] Thiết lập bảng cảnh báo ngân sách Cloud Monitoring Budget Alert ($50 / $100).
