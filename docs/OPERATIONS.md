# Sổ Tay Vận Hành & Thiết Lập Môi Trường (Operations Guide): DevSpeak AI

Tài liệu này cung cấp hướng dẫn chi tiết từng bước để khởi chạy, kiểm thử, vận hành và khắc phục sự cố hệ thống DevSpeak AI trên môi trường cục bộ (Local) và các môi trường đám mây (GCP).

---

## 1. Yêu Cầu Tiền Đề & Nền Tảng Kỹ Thuật

Môi trường máy phát triển được cấu hình và kiểm định theo đường cơ sở sau:

| Công cụ | Trạng thái | Phiên bản | Đường dẫn / Ghi chú |
| :--- | :--- | :--- | :--- |
| **Python** | Đã cài đặt | `3.12.10+` | Quản lý môi trường qua virtualenv (`apps/api/.venv`) |
| **Node.js** | Đã cài đặt | `v24.20.0+` | Runtime cho Next.js 15 PWA |
| **npm** | Đã cài đặt | `11.19.0+` | Quản lý dependencies frontend |
| **Git** | Đã cài đặt | `2.55.0+` | Quản lý mã nguồn phân tán |
| **Docker** | Đã cài đặt | `28.0.0+` | Chạy Docker Compose và build container images |
| **Kubernetes (kind)** | Đã cài đặt | `0.27.0+` | Cụm Kubernetes cục bộ `devspeak-local` |
| **Helm** | Đã cài đặt | `v3.17.0+` | Đóng gói và phát hành ứng dụng Kubernetes |
| **Google Cloud SDK**| Đã cài đặt | `511.0.0+` | Quản trị tài nguyên GCP và xác thực bảo mật |
| **Terraform** | Đã cài đặt | `1.10.0+` | Khởi tạo hạ tầng dưới dạng mã (IaC) |

> [!NOTE]
> Trên hệ điều hành Windows, nếu các lệnh như `python`, `git`, hoặc `node` không nhận diện được trong phiên PowerShell mới mở, hãy làm mới PATH bằng lệnh:
> ```powershell
> $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
> ```

---

## 2. Hướng Dẫn Khởi Chạy Local Native (Không Dùng Container)

### 2.1 Khởi chạy Backend (`apps/api`)
```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
cp .env.example .env
```

### 2.2 Khởi tạo Database & Chạy Migration (Alembic)
Môi trường phát triển cục bộ mặc định sử dụng SQLite độc lập, chi phí bằng 0.
```powershell
cd apps/api
.\.venv\Scripts\Activate.ps1
# Chạy tất cả migration lên phiên bản mới nhất
python -m alembic upgrade head

# Quay lui 1 bước migration nếu cần:
python -m alembic downgrade -1
```

### 2.3 Chạy Backend Server
```powershell
cd apps/api
.\.venv\Scripts\Activate.ps1
python -m uvicorn src.main:app --host 127.0.0.1 --port 8000
```
Tài liệu API tương tác khả dụng tại:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 2.4 Khởi chạy Frontend (`apps/web`)
```powershell
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```
Giao diện ứng dụng truy cập tại: `http://localhost:3001`

---

## 3. Khởi Chạy Bằng Docker Compose (Track A - Local)

Docker Compose cung cấp toàn bộ ngăn xếp gồm Frontend, FastAPI Backend và PostgreSQL 16 containerized:

```powershell
# 1. Khởi chạy toàn bộ hệ thống ở chế độ nền
docker compose up -d --build

# 2. Kiểm tra trạng thái và healthcheck của các container
docker compose ps

# 3. Xem log thời gian thực
docker compose logs -f api
docker compose logs -f web

# 4. Điểm truy cập:
# Frontend Web: http://localhost:3001
# Backend API:  http://localhost:8000
# Health check: http://localhost:8000/readyz
# Swagger Docs: http://localhost:8000/docs

# 5. Dừng các container (giữ nguyên dữ liệu database)
docker compose down

# 6. Dừng container và xóa volume dữ liệu
docker compose down -v
```

---

## 4. Khởi Chạy Kubernetes Local Với kind & Helm (Track B - Local)

DevSpeak AI cung cấp bộ script tự động hóa khởi tạo cụm kind, cài đặt NGINX Ingress Controller, nạp Docker image và triển khai Helm chart:

```powershell
# 1. Khởi tạo cụm kind và triển khai toàn bộ ứng dụng
.\deploy\gitops\scripts\setup-local.ps1

# 2. Kiểm tra trạng thái pods và ingress trong cụm
kubectl get pods -n devspeak-local
kubectl get ingress -n devspeak-local

# 3. Điểm truy cập dịch vụ:
# Web Frontend:        http://localhost/
# REST API Endpoint:   http://localhost/api/v1/questions
# Health Readiness:    http://localhost/readyz

# 4. Dọn dẹp và hủy cụm kind khi không sử dụng
.\deploy\gitops\scripts\teardown-local.ps1
```

---

## 5. Vận Hành Cụm GKE Autopilot & Argo CD (Track B - Production)

Hệ thống GitOps trên Google Kubernetes Engine (GKE Autopilot) được tự động đồng bộ qua Argo CD:

### 5.1 Các lệnh kiểm tra trạng thái cụm
```powershell
# Lấy credentials kết nối GKE
gcloud container clusters get-credentials devspeak-gke-portfolio --region asia-southeast1 --project project-12679df0-893b-4260-924

# Kiểm tra pods trong namespace sản xuất
kubectl get pods -n devspeak-gke-portfolio -o wide

# Kiểm tra ứng dụng Argo CD
kubectl get applications -n argocd
```

### 5.2 Khởi tạo kết nối an toàn qua Port-Forward Tunnels
Nếu không sử dụng Public Load Balancer để tiết kiệm chi phí, sử dụng script port-forward nền:
```powershell
# Mở tunnel an toàn cho Web (3002), API (8002) và Argo CD (8080)
.\deploy\gitops\scripts\start-gke-tunnels.ps1

# Hủy toàn bộ tài nguyên GKE khi kết thúc vòng đời dự án
.\deploy\gitops\scripts\teardown-gke.ps1
```

---

## 6. Chế Độ Đánh Giá AI: Mock Deterministic & Live Google Gemini

### 6.1 Chế độ Mock Deterministic (0 Chi Phí, Bảo Mật Tuyệt Đối)
Mặc định hệ thống chạy chế độ `AI_PROVIDER=mock`:
- Sử dụng thuật toán heuristic nội bộ phân tích độ dài từ, số bước STAR và từ khóa kỹ thuật.
- Hoàn toàn không gọi API ra ngoài, chi phí 0 đồng, bảo mật dữ liệu tuyệt đối.

### 6.2 Kích hoạt Google Gemini 2.0 Flash
Để kích hoạt trí tuệ nhân tạo tạo sinh thực tế:
1. Truy cập [Google AI Studio](https://aistudio.google.com/) và tạo API key (miễn phí 15 RPM).
2. Cấu hình biến môi trường trong file `.env` (chú ý: **KHÔNG** commit file này lên Git):
   ```ini
   ENVIRONMENT=development
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSy...YourKey...
   GEMINI_MODEL=gemini-2.0-flash
   AI_TIMEOUT_SECONDS=25
   AI_MAX_RETRIES=2
   ```
3. Khởi động lại backend API và kiểm tra `GET http://127.0.0.1:8000/readyz` hiển thị `"ai_provider": "gemini"`.

---

## 7. Bộ Lệnh Kiểm Định & Chất Lượng (Verification Commands)

### 7.1 Kiểm định Backend (`apps/api`)
```powershell
cd apps/api
# Kiểm tra định dạng và phong cách mã nguồn
.\.venv\Scripts\ruff.exe check .
.\.venv\Scripts\ruff.exe format --check .

# Quét lỗ hổng bảo mật SAST
.\.venv\Scripts\python.exe -m bandit -r src
.\.venv\Scripts\python.exe -m pip_audit -r requirements.txt

# Chạy toàn bộ 70 bài kiểm thử tự động
.\.venv\Scripts\python.exe -m pytest -v
```

### 7.2 Kiểm định Frontend (`apps/web`)
```powershell
cd apps/web
# Kiểm tra kiểu dữ liệu TypeScript
npm run type-check

# Kiểm tra chất lượng mã nguồn ESLint
npm run lint

# Chạy toàn bộ 58 bài kiểm thử Vitest
npm test

# Kiểm tra đóng gói build sản phẩm
npm run build
```

---

## 8. Hướng Dẫn Sao Lưu & Phục Hồi Cơ Sở Dữ Liệu

### 8.1 Sao lưu SQLite (Local Development)
```powershell
python -c "import sqlite3; src = sqlite3.connect('devspeak.db'); bck = sqlite3.connect('devspeak_backup.db'); src.backup(bck); bck.close(); src.close(); print('Backup complete.')"
```

### 8.2 Sao lưu Cloud SQL PostgreSQL (GCP Production)
- **Tự động hàng ngày**: Cloud SQL được cấu hình sao lưu tự động vào khung giờ cố định (`03:00 UTC`).
- **Lưu trữ WAL & PITR**: Nhật ký giao dịch được giữ trong 7 ngày, cho phép khôi phục về bất kỳ giây nào trong 7 ngày qua.
- **Tạo bản sao lưu tức thì (On-demand Backup)**:
  ```powershell
  gcloud sql backups create --instance=devspeak-db-ef9683a6 --description="Pre-maintenance backup" --project=project-12679df0-893b-4260-924
  ```
