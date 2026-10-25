# Kế Hoạch Quản Trị Chi Phí Đám Mây & Ngân Sách GCP (FinOps): DevSpeak AI

**Ngân sách khả dụng**: $300 USD Google Cloud Free Trial (Kỳ hạn 90 ngày)  
**Mục tiêu vận hành**: Triển khai song song cả Track A (Cloud Run) và Track B (GKE Autopilot)  
**Khu vực triển khai**: `asia-southeast1` (Singapore)  
**Chính sách quản trị FinOps**: Tối ưu hóa tài nguyên, scale-to-zero khi có thể, cân đối HA trong giới hạn ngân sách $300.

---

## 1. Tóm Tắt Ngân Sách & Đánh Giá Khả Thi (Executive Summary)

Dự án DevSpeak AI được cấp **$300 USD tín dụng dùng thử (Free Trial)** trong 90 ngày. Việc duy trì đồng thời cả 2 phương án kiến trúc (Track A và Track B) đòi hỏi chiến lược kiểm soát tài nguyên chặt chẽ:

- **Track A (Serverless)**: Cloud Run tự động co giãn về 0 khi không có tải (`min_instances=0`), chi phí tính toán xấp xỉ **$0 - $1.00/tháng**.
- **Cơ sở dữ liệu trung tâm**: Cloud SQL PostgreSQL 16 (`db-f1-micro`, 10GB SSD) tiêu tốn cố định **~$10.50 - $12.65/tháng**.
- **Track B (Kubernetes GKE Autopilot)**: 
  - GKE Autopilot miễn phí phí quản lý cụm ($74.40/tháng) cho 1 cụm Autopilot đầu tiên trên mỗi Billing Account!
  - Pods chỉ trả tiền theo đúng vCPU và RAM thực tế yêu cầu (`requests` thấp: 100m vCPU, 128-256Mi RAM): **~$35.00 - $48.00/tháng**.
  - Ingress External Load Balancer: **~$18.25/tháng** (hoặc $0 nếu chuyển sang mô hình Port-Forward Tunnels).

### Bảng Dự Báo Tiêu Hao Ngân Sách 90 Ngày:
```
Tín dụng khả dụng:             $300.00 USD
Phương án 1 (GKE có Public LB): ~$81.39 / tháng  => 90 ngày: ~$244.17 (Dưới trần $300, còn dư ~$55.83)
Phương án 2 (GKE Port-Forward): ~$63.14 / tháng  => 90 ngày: ~$189.42 (Dưới trần $300, còn dư ~$110.58)
Mức độ tiêu thụ:                63% - 81% ngân sách Free Trial (Hoàn toàn an toàn)
```

---

## 2. Bảng Phân Tích Chi Tiết Chi Phí Hàng Tháng (GCP Services)

| Dịch vụ GCP | Cấu hình tài nguyên | Định mức miễn phí (Free Tier) | Đơn giá ước tính | Chi phí hàng tháng (USD) | Tính chất chi phí |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cloud Run (Frontend & API)** | 4 services (Staging & Prod), `min_instances=0`, `max=2-3` | 2M requests/tháng, 360k vCPU-s, 180k GiB-s | $0.00002400 / vCPU-s | **$0.00 – $1.00** | Scale-to-Zero |
| **Cloud SQL PostgreSQL** | Cấu hình `db-f1-micro`, 10 GB SSD, sao lưu tự động & PITR 7 ngày | Không có free tier cho Cloud SQL | ~$0.0130 / giờ + $0.17/GB SSD | **$10.50 – $12.65** | Bắt buộc (Cố định) |
| **GKE Autopilot Compute** | 2 Replicas Web + 2 Replicas API (yêu cầu nhẹ: 0.25 vCPU, 512MiB mỗi pod) | Miễn phí phí cụm Autopilot đầu tiên | ~$0.0445 / vCPU-giờ + $0.0049 / GiB-giờ | **$35.00 – $48.00** | Theo Pod thực tế |
| **GKE External Load Balancer** | Quy tắc chuyển tiếp Forwarding Rule cho Ingress IP `35.201.109.36` | Không có | ~$0.025 / giờ cho 5 rules đầu | **$18.25** (Hoặc $0 với tunnel) | Mạng hạ tầng |
| **Artifact Registry** | Kho lưu trữ Docker `devspeak-docker` (Chính sách giữ 3 tag gần nhất) | 0.5 GB/tháng miễn phí | $0.10 / GB-tháng | **$0.15 – $0.30** | Lưu trữ ảnh container |
| **Secret Manager** | Quản lý khóa DB, JWT, Gemini API key (6 secret versions) | 6 active versions & 10.000 lượt truy vấn | $0.06 / version | **$0.00** (Trong hạn mức) | Bảo mật |
| **Cloud Storage** | Bucket lưu trữ Terraform State & bản sao lưu CSDL | 5 GB Regional storage miễn phí | $0.020 / GB-tháng | **$0.02** | Lưu trữ |
| **Google Gemini API** | Model `gemini-2.0-flash` qua Google AI Studio | 15 RPM, 1.500 requests/ngày miễn phí | Miễn phí trong hạn mức | **$0.00** | AI Provider |
| **TỔNG CỘNG HÀNG THÁNG** | — | — | — | **~$63.92 – $81.39 / tháng** | **Kiểm Soát Trong Ngân Sách** |

---

## 3. So Sánh Đánh Giá Cơ Sở Dữ Liệu: `db-f1-micro` vs Multi-Zone HA

| Tiêu chí | Cấu hình Lựa Chọn: `db-f1-micro` (Single-zone + PITR) | Cấu hình Multi-Zone HA (`db-custom-1-3840`) |
| :--- | :--- | :--- |
| **Cấu hình phần cứng** | 1 Shared vCPU, 0.6 GB RAM, 10 GB SSD | 1 Dedicated vCPU, 3.75 GB RAM, Standby Replica |
| **Chi phí hàng tháng** | **~$10.50 – $12.65 / tháng** | **~$79.50 – $105.00 / tháng** |
| **Chiếm dụng 90 ngày** | **~$35.00 USD** (11.6% ngân sách $300) | **~$280.00 USD** (93.3% ngân sách $300 - Nguy cơ cạn kiệt!) |
| **Khả năng chịu tải** | Hỗ trợ 25 kết nối đồng thời (đáp ứng tốt nhu cầu demo) | Hỗ trợ 100+ kết nối đồng thời |
| **Khả năng phục hồi** | Tự động sao lưu hàng ngày + khôi phục PITR 7 ngày (RTO < 30p, RPO < 5p) | Tự động chuyển đổi dự phòng (Automatic Failover) tức thì |
| **Quyết định FinOps** | **CHẤP THUẬN ĐƯA VÀO VẬN HÀNH**. Đảm bảo an toàn tài chính. | **TỪ CHỐI**. Tránh việc đốt sạch ngân sách của người dùng. |

---

## 4. Các Quy Định Cấm Tuyệt Đối Để Tránh Phát Sinh Chi Phí Đột Biến

1. ❌ **Không khởi tạo GKE Standard Cluster**: GKE Standard tính phí cố định cụm ($74.40/tháng) cộng phí node VM đầy đủ bất kể có pod chạy hay không. Chỉ sử dụng **GKE Autopilot**.
2. ❌ **Không kích hoạt Cloud NAT Gateway**: Cloud NAT tính phí cố định cổng ~$32.00/tháng ngay cả khi truyền 0 byte.
3. ❌ **Không thuê GPU**: GPU trên đám mây có giá từ $0.50 - $3.50+/giờ ($350 - $2.500/tháng). Toàn bộ xử lý AI được ủy thác cho Gemini API qua Cloud Run hoặc chạy Mock nội bộ.
4. ❌ **Không cấu hình `min_instances > 0` trên Cloud Run**: Để Cloud Run luôn co giãn về 0 khi nhàn rỗi.

---

## 5. Cấu Hình Cảnh Báo Ngân Sách Khuyến Nghị (Budget Alerts)

Khuyến nghị thiết lập hạn mức cảnh báo trong Google Cloud Console:
- **Hạn mức trần**: **$80.00 USD / tháng**
- **Các mốc kích hoạt thông báo email**:
  - `50% ($40.00)`: Mức tiêu thụ bình thường dự kiến.
  - `75% ($60.00)`: Cảnh báo sớm mức tiêu thụ.
  - `90% ($72.00)`: Cảnh báo khẩn cấp, cần kiểm tra tài nguyên.
  - `100% ($80.00)`: Ngăn chặn vượt ngân sách.

---

## 6. Kịch Bản Thu Hồi Tài Nguyên An Toàn (Teardown Playbook)

Khi kết thúc thời gian biểu diễn dự án hoặc khi muốn bảo lưu toàn bộ tài khoản:

```powershell
# 1. Xuất bản sao lưu cơ sở dữ liệu PostgreSQL ra Cloud Storage
gcloud sql export sql devspeak-db-ef9683a6 gs://devspeak-tf-state-project-12679df0-893b-4260-924/backups/devspeak_final_backup.sql --database=devspeak

# 2. Xóa cụm GKE Autopilot (tiết kiệm ngay ~$55/tháng)
.\deploy\gitops\scripts\teardown-gke.ps1

# 3. Phá hủy hạ tầng Cloud Run bằng Terraform nếu không dùng tiếp
cd infra/terraform/environments/prod
terraform destroy -auto-approve
```
