# Bằng Chứng Phát Hành & Kiểm Định Chất Lượng (Release Evidence): DevSpeak AI

**Phiên bản phát hành**: v1.0.2-candidate  
**Ngày phát hành**: 25/10/2026  
**Chuyên gia thẩm định**: Principal DevSecOps Engineer & Cloud Platform Architect  
**Trạng thái kiểm định**: 🟢 **ĐÃ XÁC THỰC TRỰC TIẾP TRÊN CẢ 5 MÔI TRƯỜNG**

---

## 1. Bằng Chứng Xác Thực Trực Tiếp 5 Môi Trường (Live Environment Probes)

| Môi trường | Lộ trình | URL truy cập kiểm định | Mã trạng thái | Thời gian phản hồi | Kết quả kiểm tra dữ liệu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Docker Compose** | Track A (Local) | `http://localhost:3001` (Web)<br>`http://localhost:8000/readyz` (API) | **200 OK**<br>**200 OK** | 123 ms<br>39 ms | 🟢 3/3 container healthy, tải 26 câu hỏi |
| **2. Local kind (K8s)** | Track B (Local) | `http://localhost/` (Web)<br>`http://localhost/readyz` (API) | **200 OK**<br>**200 OK** | 45 ms<br>28 ms | 🟢 Revision 2: Bản vá v1.0.2 đã nạp, sửa lỗi tiền tố `/api/v1` |
| **3. Cloud Run Staging**| Track A (GCP) | `https://devspeak-web-staging-ygz4gsol4q-as.a.run.app`<br>`https://devspeak-api-staging-ygz4gsol4q-as.a.run.app/readyz` | **200 OK**<br>**200 OK** | 3.8 s<br>7.1 s | 🟢 Khởi động lạnh an toàn, kết nối CSDL tốt |
| **4. Cloud Run Prod** | Track A (GCP) | `https://devspeak-web-prod-ygz4gsol4q-as.a.run.app`<br>`https://devspeak-api-prod-ygz4gsol4q-as.a.run.app/readyz` | **200 OK**<br>**200 OK** | 2.8 s<br>9.2 s | 🟢 Đang phục vụ trực tiếp tại Singapore |
| **5. GKE Autopilot** | Track B (GCP) | `http://35.201.109.36/` (Web)<br>`http://35.201.109.36/readyz` (API) | **200 OK**<br>**200 OK** | 177 ms<br>88 ms | 🟢 Argo CD Synced, Ingress External LB hoạt động |

---

## 2. Bằng Chứng Củng Cố Bảo Mật IAM Trên Google Cloud Platform

Lệnh kiểm tra:
```bash
gcloud iam service-accounts get-iam-policy devspeak-prod-deployer-sa@project-12679df0-893b-4260-924.iam.gserviceaccount.com
```

Kết quả xác thực thực tế từ GCP IAM API:
```yaml
bindings:
- members:
  - principal://iam.googleapis.com/projects/359194986638/locations/global/workloadIdentityPools/github-actions-pool/subject/repo:nguyenlpn2015/DevSpeak-AI:ref:refs/heads/main
  role: roles/iam.workloadIdentityUser
etag: BwZHR7qN_1U=
version: 1
```
*Đánh giá*: Đã xóa bỏ hoàn toàn quyền repo-wide cũ. Chỉ có duy nhất commit đã merge vào nhánh `main` mới có thể đảm nhận vai trò deployer.

---

## 3. Bằng Chứng Kiểm Định Chất Lượng Mã Nguồn & Bản Vá (Local Verification)

- **Backend Pytest**: 70/70 bài kiểm thử đạt trong 6.2s (`& "apps/api/.venv/Scripts/python.exe" -m pytest apps/api/tests`).
- **Frontend Vitest**: 58/58 bài kiểm thử đạt trong 4.1s (`npm test` trong `apps/web`), bao gồm 6 bài kiểm thử toàn vẹn hành trình song ngữ.
- **TypeScript Compilation**: `npm run type-check` đạt 0 lỗi.
- **ESLint Quality Gate**: `npm run lint` đạt 0 lỗi, 0 cảnh báo.
- **Ruff Python Formatter & Linter**: `ruff check .` và `ruff format --check .` đạt 100%.
- **Terraform Validation**: `terraform validate` tại `infra/terraform/environments/prod` đạt thành công (Success! The configuration is valid).
- **Helm Chart Validation**: `helm lint` và `helm template` cho cả 2 môi trường local-kind và gke-portfolio đều đạt chuẩn cú pháp Kubernetes.
