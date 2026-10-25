# DevSpeak AI — Trợ Lý Luyện Phỏng Vấn Tiếng Anh Chuyên Sâu Cho Kỹ Sư IT & DevOps

[![GCP Production Live](https://img.shields.io/badge/GCP%20Cloud%20Run-Live%20Production-2563eb.svg)](https://devspeak-web-prod-ygz4gsol4q-as.a.run.app)
[![CI/CD DevSecOps](https://img.shields.io/badge/CI%2FCD-Keyless%20WIF%20Pipelines-10b981.svg)](https://github.com/nguyenlpn2015/DevSpeak-AI/actions)
[![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black.svg)](https://nextjs.org/)
[![Cloud SQL](https://img.shields.io/badge/Cloud%20SQL-PostgreSQL%2016-336791.svg)](https://cloud.google.com/sql)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC.svg)](https://www.terraform.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**DevSpeak AI** là nền tảng luyện phỏng vấn tiếng Anh chuyên ngành chuẩn doanh nghiệp, song ngữ (Anh - Việt), tích hợp AI Studio và đồng thời là dự án biểu diễn kỹ năng DevOps / DevSecOps / Cloud Platform trên nền tảng Google Cloud Platform (GCP). Dự án được thiết kế chuyên biệt cho kỹ sư IT, DevOps, Cloud, SRE chuẩn bị phỏng vấn kỹ thuật, báo cáo sự cố (incident briefings) và thảo luận kiến trúc hệ thống (system design) tại các tập đoàn công nghệ toàn cầu.

---

## 🌐 Các Môi Trường Triển Khai Thực Tế (5 Môi Trường — Track A & Track B)

Hệ thống được triển khai hoạt động đồng thời trên cả 5 môi trường thuộc 2 lộ trình kiến trúc:

### Track A: Serverless & Containerized Architecture (Docker Compose + GCP Cloud Run)
| Môi trường | Dịch vụ | Địa chỉ truy cập (URL) | Trạng thái |
| :--- | :--- | :--- | :--- |
| **1. Local Docker Compose** | Web Frontend (Port 3001)<br>FastAPI REST (Port 8000) | Web: [http://localhost:3001](http://localhost:3001)<br>API: [http://localhost:8000](http://localhost:8000)<br>Health: [http://localhost:8000/readyz](http://localhost:8000/readyz) | 🟢 Hoạt động (Healthy) |
| **2. GCP Cloud Run Staging** | Web Frontend<br>FastAPI REST | Web: [https://devspeak-web-staging-ygz4gsol4q-as.a.run.app](https://devspeak-web-staging-ygz4gsol4q-as.a.run.app)<br>API: [https://devspeak-api-staging-ygz4gsol4q-as.a.run.app](https://devspeak-api-staging-ygz4gsol4q-as.a.run.app)<br>Health: [https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz](https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz) | 🟢 Hoạt động (Healthy) |
| **3. GCP Cloud Run Production** | Web Frontend<br>FastAPI REST | Web: [https://devspeak-web-prod-ygz4gsol4q-as.a.run.app](https://devspeak-web-prod-ygz4gsol4q-as.a.run.app)<br>API: [https://devspeak-api-prod-ygz4gsol4q-as.a.run.app](https://devspeak-api-prod-ygz4gsol4q-as.a.run.app)<br>Health: [https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz](https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz) | 🟢 Hoạt động (Healthy) |

### Track B: Kubernetes & GitOps Platform (kind + GKE Autopilot + Helm + Argo CD)
| Môi trường | Dịch vụ | Địa chỉ truy cập (URL) | Trạng thái |
| :--- | :--- | :--- | :--- |
| **4. Local Kubernetes (kind)** | Helm + NGINX Ingress | Web: [http://localhost/](http://localhost/)<br>API: [http://localhost/api/v1/questions](http://localhost/api/v1/questions)<br>Health: [http://localhost/readyz](http://localhost/readyz) | 🟢 Hoạt động (Healthy, Rev 2) |
| **5. GCP GKE Autopilot** | Helm + Argo CD + Public LB | Web: [http://35.201.109.36/](http://35.201.109.36/)<br>API: [http://35.201.109.36/api/v1/questions](http://35.201.109.36/api/v1/questions)<br>Health: [http://35.201.109.36/readyz](http://35.201.109.36/readyz) | 🟢 Hoạt động (Healthy, Synced) |

> [!NOTE]
> **Kiến Trúc AI Độc Lập & Bảo Mật Dữ Liệu:**
> Nhằm đảm bảo tính xác thực khách quan, chi phí bên thứ ba bằng 0 và tôn trọng quyền riêng tư ứng viên (không gửi nội dung nhạy cảm ra ngoài), các môi trường showcase mặc định kích hoạt **Deterministic Heuristic Mock Provider**. Việc kích hoạt Gemini LLM có thể bật bất cứ lúc nào qua biến môi trường `AI_PROVIDER=gemini` và khóa `GEMINI_API_KEY`.

---

## 🌟 Tính Năng Nổi Bật Của Ứng Dụng

- **LinguaFlow Learning Studio**: Bảng điều khiển học tập giao diện Dark-Neon hiện đại, theo dõi chuỗi ngày học liên tục (streak), thanh tiến độ XP, mục tiêu chứng chỉ CEFR và thẻ flashcard 3D có phát âm chuẩn bản xứ.
- **Ngân Hàng 26 Câu Hỏi Chuẩn IT & DevOps**: Bao quát toàn bộ chủ đề Kubernetes internals, CI/CD DevSecOps, Linux SRE, AWS Cloud, Docker containerization, Thiết kế hệ thống (System Design) và Hành vi STAR.
- **Phòng Luyện Phỏng Vấn 3 Vùng (3-Zone Studio)**: Không gian làm việc tích hợp gồm đặc tả câu hỏi, trình biên tập câu trả lời thời gian thực, chèn thuật ngữ kỹ thuật 1 chạm, gợi ý khung STAR và câu trả lời mẫu từ chuyên gia.
- **Hội Thoại Phỏng Vấn Đa Lượt (Multi-Turn Stateful Interview Engine)**: Động cơ đối thoại phỏng vấn đa lượt mô phỏng người phỏng vấn thật phản biện các tình huống biên kỹ thuật và xuất báo cáo tổng thể.
- **Chế Độ Luyện Nói (Web Speech API Voice Mode)**: Nhận diện giọng nói thời gian thực trực tiếp từ micro trình duyệt, giúp ứng viên luyện phản xạ nói tự nhiên.
- **Đánh Giá Đa Chiều Từ AI**: Phân tích chuyên sâu 3 trụ cột: Độ chính xác kỹ thuật (Technical Accuracy), Cấu trúc logic chuẩn STAR (Clarity & Structure), và Ngữ pháp & Văn phong tiếng Anh chuyên ngành (English Fluency & Tone) theo thang điểm 1.0 - 10.0.
- **Bảo Mật Local-First**: Hoạt động ngoại tuyến 100% với AI Mock tích hợp sẵn hoặc kết nối bảo mật tới Google Gemini mà không lưu trữ thông tin nhạy cảm.

---

## 🏗️ Kiến Trúc Hệ Thống & DevSecOps (GCP & Kubernetes)

```
                            [ GitHub Actions (CI/CD) ]
                                         │
                          OIDC Token (Keyless WIF)
                                         ▼
     ┌───────────────────────── Google Cloud Platform ────────────────────────┐
     │                                                                        │
     │   [ Google Artifact Registry ] ──> Đẩy Docker Images (:git_sha)         │
     │                                                                        │
     │   [ Cloud Run Job ] ──────────────> Chạy Database Migration (Alembic)  │
     │                                                                        │
     │   [ Google Cloud Run ] (Track A)                                       │
     │   ├── devspeak-web-prod  (Next.js 15 Standalone PWA, user non-root)    │
     │   └── devspeak-api-prod  (FastAPI / Python 3.12, user non-root)        │
     │                                                                        │
     │   [ GKE Autopilot + Argo CD ] (Track B)                                │
     │   ├── Ingress NGINX / Cloud LB -> 2 Replicas Web & API (HPA)           │
     │   └── Argo CD GitOps Controller tự động đồng bộ từ Git                │
     │                                                                        │
     │   [ Google Cloud SQL ]                                                 │
     │   └── PostgreSQL 16 (Tự động Backup hàng ngày + Khôi phục PITR 7 ngày) │
     │                                                                        │
     │   [ Google Secret Manager ]                                            │
     │   └── Quản lý mật khẩu DB, khóa JWT, Gemini API key (Least-Privilege)  │
     └────────────────────────────────────────────────────────────────────────┘
```

- **Xác Thực Không Dùng Khóa Tĩnh (Keyless WIF)**: GitHub Actions xác thực vào GCP hoàn toàn qua Workload Identity Federation (WIF) chỉ gắn với nhánh `main`. Không sử dụng Service Account JSON Key tĩnh.
- **Cổng Tách Biệt Migration (Decoupled Migration Gate)**: Alembic database migration được thực thi trong Cloud Run Job độc lập trước khi chuyển hướng lưu lượng người dùng.
- **Cơ Chế Kiểm Tra Khói Tự Động (Automated Smoke Probes)**: Mọi đợt triển khai đều tự động thẩm định: probe `/readyz` 200 OK, tính toàn vẹn 26 câu hỏi, injection runtime script và kiểm tra nghiêm ngặt CORS.
- **Sao Lưu & Phục Hồi Thảm Họa (Disaster Recovery)**: Cloud SQL PostgreSQL 16 cấu hình sao lưu hàng ngày, lưu trữ nhật ký giao dịch 7 ngày cho phép Point-in-Time Recovery (PITR) với RTO < 30 phút và RPO < 5 phút.
- **Đóng Cổng Tài Liệu Trên Production**: Swagger UI (`/docs`, `/redoc`, `/openapi.json`) tự động trả về HTTP 404 trên production để bảo vệ thông tin kiến trúc.

---

## 🛠️ Công Nghệ Sử Dụng

| Tầng kiến trúc | Công nghệ chính |
| :--- | :--- |
| **Frontend** | [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), Lucide Icons, Web Speech API |
| **Backend REST API** | [Python 3.12](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), [Pydantic v2](https://docs.pydantic.dev/), [Argon2id](https://github.com/P-H-C/phc-winner-argon2), PyJWT, SQLAlchemy AsyncIO |
| **Cơ sở dữ liệu** | [PostgreSQL 16](https://www.postgresql.org/), [Alembic Migrations](https://alembic.sqlalchemy.org/) |
| **Điều phối & Container** | [Docker Compose](https://docs.docker.com/compose/), [Kubernetes (kind)](https://kind.sigs.k8s.io/), [Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine), [Helm](https://helm.sh/), [Argo CD](https://argo-cd.readthedocs.io/) |
| **Hạ tầng đám mây (GCP)** | [Cloud Run](https://cloud.google.com/run), [Cloud SQL](https://cloud.google.com/sql), [Artifact Registry](https://cloud.google.com/artifact-registry), [Secret Manager](https://cloud.google.com/secret-manager), [Terraform](https://www.terraform.io/) |
| **Bảo mật & DevSecOps** | [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation), [Vitest](https://vitest.dev/), [Pytest](https://docs.pytest.org/), [Ruff](https://astral.sh/ruff), [Bandit](https://github.com/PyCQA/bandit), [Trivy](https://trivy.dev/) |

---

## 📖 Thư Mục Tài Liệu Kỹ Thuật

- 👤 **[Sổ Tay Hướng Dẫn Sử Dụng (Candidate User Guide)](./docs/USER_GUIDE.md)**: Hướng dẫn chi tiết bằng tiếng Việt về cách trải nghiệm phòng Studio, luyện nói qua Micro và đọc báo cáo đánh giá AI.
- 🛠️ **[Tài Liệu Vận Hành & Khởi Chạy Local (Operations Guide)](./docs/OPERATIONS.md)**: Hướng dẫn thiết lập môi trường lập trình local, chạy Docker Compose, kind, Helm, và xử lý sự cố.
- 📐 **[Kiến Trúc Hệ Thống Toàn Diện (Architecture Specification)](./docs/ARCHITECTURE.md)**: Thiết kế Monorepo, sơ đồ luồng dữ liệu, hợp đồng API và các quyết định kiến trúc cốt lõi.
- 🛡️ **[Chính Sách Bảo Mật & Threat Model (Security Model)](./docs/SECURITY.md)**: Mô hình an toàn thông tin, bảo vệ bí mật, kiểm soát danh tính và phòng thủ tấn công mạng.
- 💰 **[Ước Tính & Tối Ưu Hóa Chi Phí Đám Mây (Cost Estimate & FinOps)](./docs/COST_ESTIMATE.md)**: Dự toán chi phí chi tiết, chính sách ngân sách và phương án tối ưu tài nguyên GCP.
- 🗺️ **[Lộ Trình Phát Triển Sản Phẩm (Product Roadmap)](./docs/ROADMAP.md)**: Lộ trình tính năng ngắn hạn, trung hạn và dài hạn của nền tảng.
- 📋 **[Sổ Nhật Ký Bàn Giao Kỹ Thuật (Session Handoff & Runbook)](./docs/SESSION_HANDOFF.md)**: Toàn bộ thông tin tài khoản truy cập, bằng chứng kiểm định 5 môi trường và kế hoạch bàn giao.
- 🐞 **[Danh Sách Sự Cố Đã Ghi Nhận (Known Issues)](./docs/KNOWN_ISSUES.md)**: Tổng hợp các lưu ý kỹ thuật, sự cố đã được phân tích và phương án xử lý.

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Local Docker Compose)

```bash
# 1. Clone repository
git clone https://github.com/nguyenlpn2015/DevSpeak-AI.git
cd DevSpeak-AI

# 2. Khởi chạy toàn bộ hệ thống bằng Docker Compose
docker compose up -d --build

# 3. Truy cập các dịch vụ
# Web Frontend (PWA):  http://localhost:3001
# FastAPI REST API:    http://localhost:8000
# Kiểm tra Health:     http://localhost:8000/readyz
# Tài liệu Swagger UI: http://localhost:8000/docs
```

---

## 📄 Giấy Phép Sử Dụng

Dự án được phân phối dưới giấy phép [MIT License](LICENSE).
