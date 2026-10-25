# ADR-0001: Cấu Trúc Monorepo & Lựa Chọn Ngăn Xếp Công Nghệ Cốt Lõi

## Trạng Thái
**CHẤP THUẬN (ACCEPTED)** (19/10/2026)

---

## Ngữ Cảnh Quyết Định
Dự án DevSpeak AI được khởi xướng với vai trò là trợ lý luyện phỏng vấn tiếng Anh chuyên ngành IT & DevOps, hướng tới hai mục tiêu song song:
1. Mang lại một sản phẩm học tập hữu ích, bảo mật, tin cậy và tiết kiệm chi phí cho người dùng thực tế.
2. Đóng vai trò là dự án portfolio chuẩn mực về DevOps và DevSecOps trên nền tảng đám mây Google Cloud Platform.

Chúng tôi cần lựa chọn cấu trúc repository, framework frontend, backend và chiến lược cơ sở dữ liệu nhằm cân bằng giữa tốc độ phát triển, khả năng kiểm thử, tính kinh tế local-first và khả năng mở rộng nền tảng trong tương lai.

---

## Quyết Định Kỹ Thuật

1. **Cấu Trúc Repository**:
   - Áp dụng mô hình **Modular Monorepo** (`apps/web`, `apps/api`, `deploy/gitops`, `infra/terraform`, `docs/`).
   - *Lý do*: Một nguồn chân lý duy nhất (Single Source of Truth) giúp đồng bộ schema giữa frontend và backend, quản lý hạ tầng Terraform và tài liệu kỹ thuật tập trung.

2. **Framework Tầng Frontend**:
   - Lựa chọn **Next.js 15 (App Router)** với **TypeScript** và **Tailwind CSS**.
   - *Lý do*: Hỗ trợ PWA mạnh mẽ, tối ưu SEO qua Server Components cho danh mục câu hỏi, điều hướng mượt mà và hệ sinh thái rộng lớn.

3. **Framework Tầng Backend**:
   - Lựa chọn **Python 3.12+** kết hợp **FastAPI** và **Pydantic v2**.
   - *Lý do*: Hỗ trợ bất đồng bộ native (AsyncIO), kiểm định schema đầu vào chặt chẽ, tự động sinh tài liệu OpenAPI/Swagger và tích hợp hoàn hảo với hệ sinh thái AI.

4. **Kiến Trúc Tầng Đánh Giá AI**:
   - Xây dựng lớp trừu tượng **AI Adapter Interface** hỗ trợ:
     - *Deterministic Mock Provider*: Hoạt động ngoại tuyến 100%, chi phí 0đ phục vụ kiểm thử CI/CD.
     - *Pluggable Live LLM Provider*: Tích hợp linh hoạt Google Gemini 2.0 Flash khi cần AI tạo sinh thực tế.

5. **Cơ Sở Dữ Liệu**:
   - **PostgreSQL 16** (sử dụng SQLAlchemy 2.0 AsyncIO và Alembic cho migration).
   - Hỗ trợ SQLite (qua `aiosqlite`) làm phương án fallback cho môi trường test độc lập cục bộ.

---

## Các Phương Án Đã Cân Nhắc & Lý Do Từ Chối
- **Toàn bộ ngăn xếp bằng TypeScript (Next.js + NestJS/Express)**:
  - *Từ chối*: Dù TypeScript đồng nhất rất hấp dẫn, Python vẫn là tiêu chuẩn vàng trong lĩnh vực xử lý AI, phân tích văn bản và công cụ SRE/DevOps.
- **Kiến trúc Microservices ngay từ ngày đầu**:
  - *Từ chối*: Vi phạm nguyên tắc "Ưu tiên Modular Monolith trước khi chia nhỏ Microservices". Việc chia nhỏ quá sớm sẽ tạo ra gánh nặng theo dõi phân tán (distributed tracing) và độ trễ mạng không cần thiết.
- **Gọi trực tiếp LLM từ trình duyệt Frontend**:
  - *Từ chối*: Rất mất an toàn, làm lộ API key trong mã nguồn client, không kiểm soát được hạn mức sử dụng và tạo ra nguy cơ cạn kiệt ngân sách người dùng.
