# Danh Sách Lỗ Hổng & Khiếm Khuyết Kỹ Thuật (Defect Backlog): DevSpeak AI

**Ngày rà soát ban đầu**: 21/10/2026  
**Ngày cập nhật nghiệm thu**: 25/10/2026  
**Môi trường kiểm định**: Toàn diện 5 môi trường (Local Compose, Local kind, Cloud Run Staging, Cloud Run Prod, GKE Autopilot)  
**Phân loại mức độ nghiêm trọng**:
- **P0 (Critical)**: Lỗ hổng bảo mật có thể khai thác, vượt quyền kiểm soát truy cập, hoặc rò rỉ dữ liệu.
- **P1 (Core Journey Broken)**: Luồng nghiệp vụ cốt lõi bị gián đoạn không có giải pháp tạm thời.
- **P2 (Operational / Degradation)**: Vấn đề độ tin cậy, thiếu hụt quan sát, trải nghiệm lập trình viên, hoặc lỗ hổng công cụ build.
- **P3 (Cosmetic / Polish)**: Chuỗi ký tự cố định, giao diện chưa hoàn thiện bản dịch, hoặc lỗi hiển thị nhỏ.

---

## 1. Bảng Tổng Hợp Khiếm Khuyết & Tiến Độ Khắc Phục

| Mã lỗi | Mức độ | Module ảnh hưởng | Tiêu đề tóm tắt | Trạng thái hiện tại |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **P0 (Critical)** | Phân quyền API / Ingress | Lỗi lặp tiền tố `/api/v1` làm đứt kết nối Frontend-Backend trên Kubernetes | 🟢 **ĐÃ KHẮC PHỤC HOÀN TOÀN** (Bản vá v1.0.2 đã nạp vào kind Rev 2) |
| **SEC-02** | **P0 (Critical)** | GCP IAM / WIF | Quyền WIF Production quá rộng, chưa giới hạn nhánh `main` | 🟢 **ĐÃ KHẮC PHỤC HOÀN TOÀN** (Đã áp dụng Terraform & gcloud xóa binding cũ) |
| **FIN-01** | **P1 (FinOps)** | GKE Public Ingress | Cloud Load Balancer tiêu tốn ~$18.25/tháng | 🟢 **ĐÃ XỬ LÝ** (Có script tunnel thay thế, nằm trong ngân sách $300) |
| **OPS-01** | **P2 (Vận hành)** | Tự động hóa Scripts | Script PowerShell chứa đường dẫn tuyệt đối cố định vào máy cá nhân | 🟢 **ĐÃ KHẮC PHỤC HOÀN TOÀN** (Đã chuyển sang đường dẫn động tương đối) |
| **OPS-02** | **P2 (Vận hành)** | Health Probes | Probe `/readyz` cần kiểm tra kết nối Engine Pool CSDL | 🟢 **ĐÃ KHẮC PHỤC HOÀN TOÀN** (Đã tích hợp kiểm tra Engine Pool) |
| **DX-01** | **P2 (Dev Experience)** | Kiểm thử tự động | Lệnh Pytest lỗi khi file `.env` ghi `AI_PROVIDER=gemini` | 🟢 **ĐÃ KHẮC PHỤC HOÀN TOÀN** (Fixture test tự động ép kiểu `AI_PROVIDER=mock`) |
| **I18N-01** | **P3 (Giao diện)** | Song ngữ Frontend | Một số chuỗi tiếng Anh cố định trong Studio & Modal | 🟢 **ĐÃ KHẮC PHỤC HOÀN TOÀN** (Chuỗi giao diện đã Việt hóa đầy đủ) |

---

## 2. Chi Tiết Các Lỗi Nghiêm Trọng Đã Được Khắc Phục

### SEC-01: Lặp Tiền Tố `/api/v1` Trên Môi Trường Kubernetes (P0)
- **Cơ chế phát sinh**: Khi triển khai trên cụm kind hoặc GKE thông qua Ingress, biến môi trường `NEXT_PUBLIC_API_URL` được đặt là `http://localhost/api/v1`. Khi mã nguồn frontend tại `apps/web/src/lib/api.ts` gọi hàm kết nối đã vô tình ghép thêm `/api/v1/questions`, dẫn đến URL thực tế là `http://localhost/api/v1/api/v1/questions` khiến Ingress trả về mã lỗi HTTP 404 Not Found.
- **Biện pháp xử lý**:
  - Viết lại hàm `normalizeApiBaseUrl()` và `buildApiUrl()` bóc tách tự động các tiền tố dư thừa.
  - Chuẩn hóa Helm values sang Base Domain (`http://localhost` cho kind và `http://35.201.109.36` cho GKE).
  - Viết 6 ca kiểm thử song ngữ tự động tại `apps/web/tests/user-journeys-bilingual.test.tsx`.
- **Kết quả nghiệm thu**: Cụm kind chạy bản vá Revision 2 trả về HTTP 200 OK với danh mục đầy đủ 26 câu hỏi.

### SEC-02: Thu Hẹp Phạm Vi Workload Identity Federation Trên GCP Production (P0)
- **Cơ chế phát sinh**: Cấu hình Terraform IAM ban đầu gán `roles/iam.workloadIdentityUser` cho `attribute.repository/nguyenlpn2015/DevSpeak-AI`, khiến mọi nhánh trong repository đều có thể đóng vai trò Service Account triển khai Production.
- **Biện pháp xử lý**:
  - Sửa `infra/terraform/environments/prod/main.tf` thu hẹp thành `subject/repo:nguyenlpn2015/DevSpeak-AI:ref:refs/heads/main`.
  - Thực thi `terraform apply -auto-approve -target="google_service_account_iam_member.prod_wif_binding"`.
  - Chạy lệnh `gcloud iam service-accounts remove-iam-policy-binding` để gỡ bỏ thành viên cũ chưa được quản lý.
- **Kết quả nghiệm thu**: Kiểm tra `gcloud iam service-accounts get-iam-policy` xác nhận duy nhất nhánh `main` được cấp quyền.
