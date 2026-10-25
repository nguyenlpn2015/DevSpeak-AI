# Danh Sách Sự Cố Đã Ghi Nhận (Known Issues): DevSpeak AI

Tài liệu này theo dõi toàn bộ các lỗi kỹ thuật, nợ công nghệ (technical debt), rào cản môi trường và các giải pháp khắc phục tạm thời (workarounds) của dự án DevSpeak AI.

---

## 1. Các Vấn Đề Đang Được Theo Dõi (Active Operational Considerations)

### 1.1 Khác Biệt Giữa Gói Gemini Cá Nhân ($20/tháng) và Google AI Studio Developer Key
- **Mức độ nghiêm trọng**: Lưu ý vận hành (Informational)
- **Thành phần**: Tích hợp AI Provider
- **Mô tả**: Người dùng thường nhầm lẫn giữa gói tiêu dùng Google One AI Premium ($20/tháng sử dụng giao diện web gemini.google.com) và quyền truy cập API lập trình. Để ứng dụng gọi được mô hình Gemini, cần có API key lập trình được tạo từ **Google AI Studio** (`aistudio.google.com`).
- **Giải pháp xử lý**:
  - DevSpeak AI ghi rõ tài liệu hướng dẫn tạo key miễn phí (15 RPM) trong `docs/OPERATIONS.md`.
  - Mặc định ứng dụng chạy ở chế độ `AI_PROVIDER=mock` với chi phí 0đ và độc lập ngoại tuyến.
  - Nếu cấu hình `AI_PROVIDER=gemini` nhưng thiếu key, hệ thống trả về mã lỗi HTTP 503 `AIConfigurationError` rõ ràng thay vì làm sập ứng dụng.
- **Trạng thái**: Đã tài liệu hóa và kiểm soát kiến trúc.

### 1.2 Chi Phí Cloud Load Balancer Cho GKE (FinOps Consideration)
- **Mức độ nghiêm trọng**: Thấp / FinOps (P1 FIN-01)
- **Thành phần**: Ingress GKE Autopilot
- **Mô tả**: External HTTP Load Balancer cấp phát địa chỉ IP công khai (`35.201.109.36`) cho cụm GKE tiêu tốn xấp xỉ ~$18.25/tháng phí quy tắc chuyển tiếp.
- **Giải pháp xử lý**:
  - Dự án cung cấp sẵn script `deploy/gitops/scripts/start-gke-tunnels.ps1` để chuyển đổi sang mô hình Port-Forward nội bộ an toàn (Web port 3002, API port 8002, Argo CD port 8080) với chi phí Ingress = $0 khi muốn tiết kiệm tối đa ngân sách Free Trial.
- **Trạng thái**: Đã cung cấp giải pháp kép (Public Ingress và Port-Forward Tunnels).

---

## 2. Các Vấn Đề Đã Được Khắc Phục Hoàn Toàn (Resolved Issues)

### 2.1 Trùng Lặp Tiền Tố Đường Dẫn `/api/v1` Trên Môi Trường Kubernetes (P0 SEC-01)
- **Mức độ**: Nghiêm trọng (P0)
- **Thành phần**: `apps/web/src/lib/api.ts`, `apps/web/src/app/layout.tsx`
- **Nguyên nhân**: Khi `NEXT_PUBLIC_API_URL` được cấu hình dạng `http://localhost/api/v1` hoặc URL có chứa `/api/v1`, hàm gọi API tại frontend ghép thêm `/api/v1/questions` tạo thành đường dẫn trùng lặp `/api/v1/api/v1/questions`, dẫn tới lỗi HTTP 404 Not Found trên local kind và GKE.
- **Giải pháp**: Xây dựng hàm chuẩn hóa `normalizeApiBaseUrl()` và `buildApiUrl()` tự động bóc tách tiền tố dư thừa; cập nhật Helm values cho local-kind và GKE sang chuẩn base domain (`http://localhost` và `http://35.201.109.36`). Kiểm thử tự động Vitest 58/58 passed, triển khai Cổng A lên kind Revision 2 trả về HTTP 200 OK và 26 câu hỏi.
- **Ngày khắc phục**: 2026-10-25.

### 2.2 Ràng Buộc Workload Identity Federation Quá Rộng Trên Production (P0 SEC-02)
- **Mức độ**: Nghiêm trọng (P0)
- **Thành phần**: `infra/terraform/environments/prod/main.tf`
- **Nguyên nhân**: Quyền `roles/iam.workloadIdentityUser` được gán cho toàn bộ repository (`attribute.repository/nguyenlpn2015/DevSpeak-AI`), cho phép bất kỳ nhánh thử nghiệm hoặc Pull Request nào cũng có thể giả lập quyền deployer production.
- **Giải pháp**: Sửa mã nguồn Terraform thu hẹp thành `subject/repo:nguyenlpn2015/DevSpeak-AI:ref:refs/heads/main`. Áp dụng thành công qua Terraform và `gcloud iam service-accounts remove-iam-policy-binding` để xóa hoàn toàn binding cũ.
- **Ngày khắc phục**: 2026-10-25.

### 2.3 Đường Dẫn Tuyệt Đối Cố Định Trong Các Script Vận Hành (P2 OPS-01)
- **Mức độ**: Trung bình (P2)
- **Thành phần**: `deploy/gitops/scripts/*.ps1` (5 scripts)
- **Nguyên nhân**: Script chứa đường dẫn cố định `C:\Users\Nguyen\AppData\Local\Programs\...` khiến script không chạy được trên máy của kỹ sư khác.
- **Giải pháp**: Tái cấu trúc cả 5 script sử dụng hàm phân giải đường dẫn động dựa trên `$PSScriptRoot` và kiểm tra lệnh có sẵn trên PATH (`Get-Command`).
- **Ngày khắc phục**: 2026-10-25.

### 2.4 Xung Đột Biến Môi Trường Hệ Thống Windows `DEBUG=release`
- **Mức độ**: Thấp
- **Thành phần**: Backend Settings (`apps/api/src/core/config.py`)
- **Nguyên nhân**: Biến môi trường hệ thống Windows định sẵn `DEBUG=release` gây lỗi chuyển đổi kiểu boolean trong Pydantic Settings.
- **Giải pháp**: Bổ sung hàm validator `parse_debug_value` tự động ép kiểu an toàn cho các chuỗi `release`, `prod`, `debug`.
- **Ngày khắc phục**: 2026-10-19.

### 2.5 Cảnh Báo Bandit SAST B110 Về Khối `except` Rỗng
- **Mức độ**: Thấp
- **Thành phần**: `apps/api/src/core/config.py`
- **Nguyên nhân**: Sử dụng `try: ... except Exception: pass` trong hàm phân tích danh sách origin CORS.
- **Giải pháp**: Thay thế bằng việc bắt lỗi chính xác `json.JSONDecodeError` và trả về danh sách origin chuẩn, loại bỏ hoàn toàn câu lệnh `pass`. Bandit quét lại đạt 0 cảnh báo.
- **Ngày khắc phục**: 2026-10-19.
