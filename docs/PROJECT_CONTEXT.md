# Bối Cảnh Dự Án (Project Context): DevSpeak AI

## 1. Tầm Nhìn Sản Phẩm (Product Vision)
DevSpeak AI là nền tảng học tập và huấn luyện chuyên sâu, được thiết kế nhằm giúp các kỹ sư Công nghệ Thông tin (IT), DevOps, SRE và Điện toán Đám mây (Cloud) vượt qua rào cản ngôn ngữ và kỹ năng giao tiếp tiếng Anh — yếu tố cản trở sự nghiệp của họ khi tham gia vào các đội ngũ toàn cầu và phỏng vấn quốc tế.

Thay vì học tiếng Anh giao tiếp đại trà (như Duolingo hay các khóa ESL chung chung), DevSpeak AI tập trung trực tiếp vào:
- **Diễn đạt kỹ thuật (Technical Articulation)**: Trình bày kiến trúc hệ thống, giải trình các sự cố vận hành (incident post-mortem), và trao đổi trong quá trình code review.
- **Phỏng vấn IT (IT Interviews)**: Các câu hỏi tình huống thực tế cho DevOps/SRE, các buổi phỏng vấn thiết kế hệ thống (System Design), và câu chuyện lãnh đạo theo phương pháp STAR.
- **Giao tiếp thực tế (Pragmatic Communication)**: Sự cô đọng, độ chính xác về mặt thuật ngữ kỹ thuật, sự tự tin và văn phong chuyên nghiệp chuẩn quốc tế.

## 2. Đối Tượng Người Dùng Mục Tiêu (Target Personas)
1. **Kỹ sư DevOps / Cloud / SRE**: Cần giải thích quy trình CI/CD, cơ chế tự phục hồi sự cố trên Kubernetes (CrashLoopBackOff, OOMKilled), đánh đổi kiến trúc AWS/GCP, và báo cáo sự cố bằng tiếng Anh lưu loát, có cấu trúc rõ ràng.
2. **Kỹ sư Phần mềm (Backend / Frontend / Full-Stack)**: Cần trình bày thiết kế kỹ thuật, phân tích độ phức tạp thuật toán, trả lời phỏng vấn System Design và cộng tác trơn tru trong các nghi thức Agile.
3. **Kỹ sư Mới vào nghề / Đầu sự nghiệp (Junior)**: Cần giảm bớt nỗi sợ khi phỏng vấn thông qua việc luyện tập có hướng dẫn với các câu hỏi hành vi tần suất cao (STAR) và kiến thức kỹ thuật nền tảng.

## 3. Phạm Vi Triển Khai (Scope Definition)

### Track A: Nền Tảng Serverless Cloud-Native (GCP Cloud Run & Cloud SQL)
- Triển khai FastAPI và Next.js 15 trên Google Cloud Run tự động scale-to-zero khi nhàn rỗi.
- Kết nối Cloud SQL PostgreSQL 16 qua Unix Socket bảo mật, kích hoạt Point-In-Time Recovery (PITR).
- Thiết lập quy trình CI/CD tự động bằng GitHub Actions thông qua Workload Identity Federation (WIF) không dùng key tĩnh.

### Track B: Nền Tảng Enterprise Kubernetes GitOps (kind & GKE Autopilot)
- Cụm cục bộ: Kubernetes kind với NGINX Ingress Controller và cơ sở dữ liệu phát triển.
- Cụm đám mây: GKE Autopilot khu vực `asia-southeast1`, quản lý vòng đời ứng dụng hoàn toàn qua GitOps với Argo CD v3.5.6.
- Quy chuẩn hóa kiến trúc với Helm Charts cho API và Web, kích hoạt Horizontal Pod Autoscaler (HPA).

## 4. Các Ràng Buộc Bất Biến (Non-Negotiable Constraints)
- **An toàn Bảo mật (Security First)**: Tuyệt đối không hardcode bí mật, token, private key hay commit file `.env` lên GitHub. Rà soát nghiêm ngặt toàn bộ biến môi trường.
- **Tối ưu Chi phí (Local-First & FinOps)**: Ưu tiên thực thi cục bộ (Docker Compose, kind) và kiểm soát chặt chẽ ngân sách đám mây trong ngưỡng kế hoạch ($300 USD / 90 ngày với quỹ dự phòng an toàn).
- **Phát triển Dựa trên Bằng chứng Thực tế (Evidence-Based)**: Không bao giờ công bố hoàn tất một tính năng hay cột mốc nếu chưa thực thi lệnh và kiểm tra bằng chứng thực tế từ console/log.
