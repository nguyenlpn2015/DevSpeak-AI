# Bàn Giao Kỹ Thuật (Session Handoff): DevSpeak AI — Nền Tảng GCP DevOps & DevSecOps Portfolio

## 1. Tóm Tắt Trạng Thái Dự Án
- **Tên Dự Án**: DevSpeak AI — Nền tảng luyện phỏng vấn tiếng Anh chuyên biệt cho kỹ sư IT & DevOps/SRE, triển khai chuẩn doanh nghiệp trên Google Cloud Platform và Kubernetes GitOps.
- **Tiến Độ Đạt Được**:
  - **Milestone A (Track A - Serverless Cloud Native)**: Hoàn tất 100% (Docker Compose local, Cloud Run Staging & Cloud Run Production kết nối Cloud SQL PostgreSQL 16 qua Unix Socket).
  - **Milestone B (Track B - Enterprise Kubernetes GitOps)**: Hoàn tất 100% (Local kind + NGINX Ingress, Ephemeral GKE Autopilot + Ingress Load Balancer + Argo CD v3.5.6).
  - **Phase 2 & Phase 3 (DevSecOps Remediation & Live Verification)**:
    - **Cổng A (Local kind)**: **ĐÃ TRIỂN KHAI & XÁC THỰC THỰC TẾ (DEPLOYED AND LIVE-VERIFIED)**. Image `devspeak-web:v1.0.2-candidate` đã được nạp vào kind cluster `devspeak-local`, Helm upgrade lên Revision 2, Web UI gọi API qua Ingress trả về đầy đủ 26 câu hỏi, loại bỏ hoàn toàn lỗi 404.
    - **Cổng B (Production WIF Lock)**: **ĐÃ TRIỂN KHAI & XÁC THỰC THỰC TẾ (DEPLOYED AND LIVE-VERIFIED)**. Terraform targeted apply thành công trên GCP IAM; policy live của `devspeak-prod-deployer-sa` đã được khóa chặt duy nhất vào nhánh `refs/heads/main`, loại bỏ hoàn toàn binding repository diện rộng.
    - **Script Portability**: Cả 5 kịch bản PowerShell đã được refactor sang `$PSScriptRoot`, không còn bất kỳ đường dẫn máy trạm cố định nào.
    - **Kiểm thử tự động**: 128/128 tests xanh tuyệt đối (70 backend pytest + 58 frontend vitest, 0 type errors, 0 lint warnings, production build thành công).
    - **Bảo mật bí mật (Secret Security)**: Không có secret/credential/token nào bị lộ, toàn bộ các file `.env` và password đều được gitignore nghiêm ngặt và không push lên GitHub.

---

## 2. Thông Tin Chi Tiết Truy Cập Toàn Bộ 5 Môi Trường (Dành Cho Kiểm Thử)

Hệ thống hiện duy trì đồng thời cả 5 môi trường sẵn sàng cho việc kiểm thử và nghiệm thu:

### Môi trường 1: Docker Compose (Local Workstation)
- **Kiến trúc**: 3 container độc lập (`devspeak-web`, `devspeak-api`, `devspeak-db` PostgreSQL 16).
- **Giao diện Web UI**: `http://localhost:3001`
- **Backend API Readiness**: `http://localhost:8000/readyz`
- **Ngân hàng 26 Câu hỏi**: `http://localhost:8000/api/v1/questions`
- **OpenAPI Swagger Docs**: `http://localhost:8000/docs`
- **Lệnh khởi động/dừng**:
  ```powershell
  docker compose up -d
  docker compose down
  ```

### Môi trường 2: Local Kubernetes kind (Local GitOps)
- **Kiến trúc**: Cluster `devspeak-local` tích hợp NGINX Ingress Controller, Helm chart revision 2 (`devspeak-web:v1.0.2-candidate`), và PostgreSQL ephemeral.
- **Giao diện Ingress Web UI**: `http://localhost/`
- **Ingress API Readiness**: `http://localhost/readyz`
- **Ingress Ngân hàng Câu hỏi**: `http://localhost/api/v1/questions`
- **Trạng thái bản vá**: Đã sửa triệt để lỗi double prefix; Web UI gọi trực tiếp API qua Ingress 200 OK.

### Môi trường 3: GCP Cloud Run Staging (Track A - Serverless Staging)
- **Kiến trúc**: Serverless container trên Google Cloud Run (`asia-southeast1`), tự động scale-to-zero khi không có traffic.
- **Giao diện Web UI**: `https://devspeak-web-staging-ygz4gsol4q-as.a.run.app`
- **Backend API Readiness**: `https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz`
- **Ngân hàng 26 Câu hỏi**: `https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/api/v1/questions`
- **Bảo mật**: API Docs bị vô hiệu hóa (HTTP 404 có chủ đích).

### Môi trường 4: GCP Cloud Run Production (Track A - Long-Term Live Showcase)
- **Kiến trúc**: Production container kết nối Cloud SQL PostgreSQL 16 qua Unix Socket, chứng chỉ SSL Google-managed tự động, scale 0-10 instances đa vùng.
- **Giao diện Web UI (Portfolio Link chính thức)**: `https://devspeak-web-prod-ygz4gsol4q-as.a.run.app`
- **Backend API Readiness**: `https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz`
- **Ngân hàng 26 Câu hỏi**: `https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/api/v1/questions`
- **Đặc điểm**: Tốc độ phản hồi cực nhanh, độ trễ thấp, giao diện song ngữ mượt mà.

### Môi trường 5: GKE Autopilot + Argo CD GitOps (Track B - Enterprise K8s)
- **Kiến trúc**: Regional cluster `devspeak-gke-portfolio` (`asia-southeast1`), 2 Autopilot compute nodes, External Application Load Balancer Anycast IP, Argo CD v3.5.6.
- **Public Ingress Web UI (HTTPS Chính Thức)**: `https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/` (IP dự phòng: `http://35.201.109.36/`)
- **Public Ingress API Readiness**: `https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/readyz`
- **Public Ingress Ngân hàng Câu hỏi**: `https://devspeak.endpoints.project-12679df0-893b-4260-924.cloud.goog/api/v1/questions`
- **Chứng chỉ SSL**: Google Managed Certificate (`devspeak-endpoints-ssl`), trạng thái **Active**, thẩm định bởi Google Trust Services.
- **Truy cập Argo CD Dashboard**:
  - Chạy đường hầm an toàn:
    ```powershell
    kubectl port-forward svc/argocd-server -n argocd 8080:443 --context gke_project-12679df0-893b-4260-924_asia-southeast1_devspeak-gke-portfolio
    ```
  - Truy cập URL: `https://localhost:8080` (Username: `admin`, Password lưu tại `deploy/gitops/.argocd-admin-password.txt`).
- **Kịch bản Khởi động Tunnels nhanh cho GKE**:
  ```powershell
  pwsh deploy/gitops/scripts/start-gke-tunnels.ps1
  ```
- **Kịch bản Tiêu hủy GKE (Bảo vệ Ngân sách khi kết thúc test)**:
  ```powershell
  pwsh deploy/gitops/scripts/teardown-gke.ps1
  ```

---

## 3. Kiến Trúc Khả Dụng Cao (High Availability - HA) & Chi Phí 90 Ngày

### A. Triển khai HA Hiện Tại (Không Vượt Quá 300% Free Trial)
- **Tầng Stateless (Web & API)**:
  - **GKE Autopilot**: Cấu hình 2 Pods API và 2 Pods Web phân bổ đều trên 2 Compute Nodes khác nhau, đi kèm Horizontal Pod Autoscaler (HPA) tự động scale theo CPU (ngưỡng 75%). Đảm bảo pod crash hoặc node migration không gây gián đoạn dịch vụ.
  - **Cloud Run Prod**: Tự động scale đa vùng (multi-zone) từ 0 đến 10 instances dựa trên tải concurrent requests.
- **Tầng Stateful (Cơ sở Dữ liệu)**:
  - **Cloud SQL PostgreSQL**: Chạy instance `db-f1-micro` đơn vùng kết hợp kích hoạt **Point-In-Time Recovery (PITR)** và lưu trữ sao lưu 7 ngày.
  - *Lý do không bật Regional Multi-Zone HA cho Cloud SQL*: Regional HA yêu cầu 1 primary và 1 standby replica đồng bộ, làm tăng chi phí từ $12.65/tháng lên ~$26.50/tháng (tiêu tốn ~$79.50/90 ngày, chiếm gần 27% ngân sách). Cấu hình đơn vùng + PITR (RTO 15-30 phút, RPO < 5 phút) là tối ưu nhất để giữ tổng chi phí 90 ngày nằm trong ngưỡng an toàn (~$189.42 - $244.17 USD vs trần $300 USD).

---

## 4. Các Bước Cần Thiết Để Kết Thúc Toàn Bộ Dự Án (Closing Roadmap)

Để nghiệm thu và kết thúc hoàn toàn dự án với 5 môi trường:

1. **Bước 1 (Kiểm thử Người dùng - User Acceptance Testing)**:
   - Bạn kiểm thử trực tiếp cả 5 môi trường theo các URL và thông tin truy cập tại **Mục 2**.
   - Kiểm tra chuyển đổi ngôn ngữ Anh - Việt, tải danh sách câu hỏi, làm bài phỏng vấn và nhận đánh giá AI.
2. **Bước 2 (Bảo vệ Ngân sách Đám mây - FinOps Action)**:
   - Khi hoàn tất kiểm thử môi trường GKE, quyết định giữ hay hủy cụm GKE:
     - *Nếu giữ GKE để demo live*: Duy trì cụm và theo dõi cảnh báo ngân sách `DevSpeak-Monthly-Budget` (ngưỡng 50%, 80%, 100%, 120%).
     - *Nếu kết thúc giai đoạn demo GKE*: Thực thi lệnh `pwsh deploy/gitops/scripts/teardown-gke.ps1` để giải phóng Load Balancer và compute, tiết kiệm ngay $54.75 cho 90 ngày; chuyển 100% demo công khai sang Cloud Run Production.
3. **Bước 3 (Đóng băng Repository & Không Push Secret)**:
   - Toàn bộ tài liệu kỹ thuật đã được chuyển ngữ sang Tiếng Việt.
   - Giữ nguyên trạng thái local sạch theo yêu cầu không commit/push lên GitHub.
